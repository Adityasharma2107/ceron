import json
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Asset, Analysis, Scan, Vulnerability
from services.analyzer import analyze_text
from services.analysis_service import get_analyses, save_analysis
from services.asset_service import (
    create_asset,
    delete_asset,
    get_asset,
    get_assets,
    update_asset,
)
from services.risk_service import get_risk_summary
from services.remediation_service import get_remediation_recommendations
from services.scan_service import create_scan, get_scans
from services.vulnerability_service import (
    create_vulnerability,
    get_vulnerabilities,
    update_vulnerability_status,
)
from services.dashboard_service import get_dashboard_summary
from services.platform_service import get_platform_status


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Analysis API
# ============================================================


class AnalysisRequest(BaseModel):
    """Request body for security analysis."""

    text: str = Field(
        min_length=1,
        max_length=10000,
    )


class DetectorResult(BaseModel):
    """Result produced by an individual security detector."""

    detected: bool

    type: Literal["prompt_injection", "pii"] | None

    severity: Literal["none", "low", "medium", "high"]

    categories: list[str] | None = None


class SecurityAnalysis(BaseModel):
    """Combined security analysis."""

    detected: bool

    severity: Literal["none", "low", "medium", "high"]

    results: list[DetectorResult]


class AnalysisResponse(BaseModel):
    """Response returned by the analysis endpoint."""

    text: str

    security_analysis: SecurityAnalysis


class AnalysisResultResponse(BaseModel):
    """A stored detector result returned in analysis history."""

    detected: bool
    type: Literal["prompt_injection", "pii"] | None
    severity: Literal["none", "low", "medium", "high"]
    categories: list[str] | None = None


class AnalysisHistoryResponse(BaseModel):
    """A persisted Ceron analysis with detector details."""

    id: int
    text: str
    severity: Literal["none", "low", "medium", "high"]
    created_at: str
    results: list[AnalysisResultResponse]


class RiskSummaryResponse(BaseModel):
    """Current risk posture derived from persisted Ceron data."""

    total_assets: int
    total_analyses: int
    detected_analyses: int
    overall_severity: Literal["none", "low", "medium", "high"]
    severity_counts: dict[str, int]


class RemediationRecommendationResponse(BaseModel):
    """Actionable guidance derived from a detected security finding."""

    id: str
    title: str
    description: str
    priority: Literal["low", "medium", "high"]
    actions: list[str]
    categories: list[str]
    affected_analyses: int
    last_detected_at: str


class ScanCreateRequest(BaseModel):
    """A scan plan requested for a tracked asset."""

    asset_id: int
    profile: Literal["baseline", "deep"] = "baseline"


class ScanResponse(BaseModel):
    """A persisted scan plan and its target metadata."""

    id: int
    asset_id: int
    asset_name: str
    asset_target: str
    profile: Literal["baseline", "deep"]
    status: Literal["queued"]
    created_at: str


class VulnerabilityCreateRequest(BaseModel):
    """A vulnerability finding recorded against a tracked asset."""

    asset_id: int
    identifier: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    severity: Literal["low", "medium", "high", "critical"]


class VulnerabilityStatusUpdateRequest(BaseModel):
    """A lifecycle transition for a recorded vulnerability."""

    status: Literal["open", "accepted_risk", "remediated"]


class VulnerabilityResponse(BaseModel):
    """A vulnerability finding and its linked asset metadata."""

    id: int
    asset_id: int
    asset_name: str
    asset_target: str
    identifier: str
    title: str
    description: str | None
    severity: Literal["low", "medium", "high", "critical"]
    status: Literal["open", "accepted_risk", "remediated"]
    created_at: str
    updated_at: str


class DashboardVulnerabilityResponse(BaseModel):
    """A recent open vulnerability shown in the operational overview."""

    id: int
    asset_name: str
    asset_target: str
    identifier: str
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    updated_at: str


class DashboardScanResponse(BaseModel):
    """A recent scan plan shown in the operational overview."""

    id: int
    asset_name: str
    asset_target: str
    profile: Literal["baseline", "deep"]
    status: Literal["queued"]
    created_at: str


class DashboardSummaryResponse(BaseModel):
    """Cross-module operational overview for the Ceron dashboard."""

    total_assets: int
    total_analyses: int
    detected_analyses: int
    overall_severity: Literal["none", "low", "medium", "high"]
    queued_scans: int
    open_vulnerabilities: int
    critical_vulnerabilities: int
    recent_vulnerabilities: list[DashboardVulnerabilityResponse]
    recent_scans: list[DashboardScanResponse]


class PlatformStatusResponse(BaseModel):
    """Safe Ceron runtime status for operator settings."""

    api_status: Literal["operational"]
    database_status: Literal["connected"]
    analysis_engine: Literal["deterministic"]
    scan_execution_enabled: bool
    authentication_enabled: bool


def analysis_to_response(analysis: Analysis) -> dict:
    """Convert a persisted analysis into the public API response shape."""

    return {
        "id": analysis.id,
        "text": analysis.text,
        "severity": analysis.severity,
        "created_at": analysis.created_at.isoformat(),
        "results": [
            {
                "detected": result.detected,
                "type": result.type,
                "severity": result.severity,
                "categories": (
                    json.loads(result.categories)
                    if result.categories
                    else None
                ),
            }
            for result in analysis.results
        ],
    }


@app.post(
    "/api/v1/analyze",
    response_model=AnalysisResponse,
)
async def analyze(
    request: AnalysisRequest,
    db: Session = Depends(get_db),
):
    """Analyze text and persist the analysis."""

    result = analyze_text(request.text)

    save_analysis(
    db=db,
    text=request.text,
    security_analysis=result,
)

    return {
        "text": request.text,
        "security_analysis": result,
    }


@app.get(
    "/api/v1/analyses",
    response_model=list[AnalysisHistoryResponse],
)
async def list_analyses(
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Return recent persisted security analyses."""

    analyses = get_analyses(db=db, limit=limit)

    return [analysis_to_response(analysis) for analysis in analyses]


@app.get(
    "/api/v1/risk/summary",
    response_model=RiskSummaryResponse,
)
async def get_risk_summary_endpoint(
    db: Session = Depends(get_db),
):
    """Return a risk posture summary from stored analyses and assets."""

    return get_risk_summary(db)


@app.get(
    "/api/v1/remediation/recommendations",
    response_model=list[RemediationRecommendationResponse],
)
async def list_remediation_recommendations(
    db: Session = Depends(get_db),
):
    """Return actionable guidance for currently recorded detector findings."""

    return get_remediation_recommendations(db)


# ============================================================
# Asset API
# ============================================================


class AssetCreateRequest(BaseModel):
    """Request body for creating an asset."""

    name: str = Field(
        min_length=1,
        max_length=255,
    )

    type: str = Field(
        min_length=1,
        max_length=50,
    )

    target: str = Field(
        min_length=1,
        max_length=500,
    )

    description: str | None = None


class AssetUpdateRequest(BaseModel):
    """Request body for updating an asset."""

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    target: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )

    description: str | None = None


class AssetResponse(BaseModel):
    """Asset returned by the API."""

    id: int
    name: str
    type: str
    target: str
    description: str | None
    created_at: str
    updated_at: str


def asset_to_response(asset: Asset) -> dict:
    """Convert an Asset database object into an API response."""

    return {
        "id": asset.id,
        "name": asset.name,
        "type": asset.type,
        "target": asset.target,
        "description": asset.description,
        "created_at": asset.created_at.isoformat(),
        "updated_at": asset.updated_at.isoformat(),
    }


def scan_to_response(scan: Scan) -> dict:
    """Convert a scan plan into the public API response shape."""

    return {
        "id": scan.id,
        "asset_id": scan.asset_id,
        "asset_name": scan.asset.name,
        "asset_target": scan.asset.target,
        "profile": scan.profile,
        "status": scan.status,
        "created_at": scan.created_at.isoformat(),
    }


def vulnerability_to_response(vulnerability: Vulnerability) -> dict:
    """Convert a vulnerability finding into the public API response shape."""

    return {
        "id": vulnerability.id,
        "asset_id": vulnerability.asset_id,
        "asset_name": vulnerability.asset.name,
        "asset_target": vulnerability.asset.target,
        "identifier": vulnerability.identifier,
        "title": vulnerability.title,
        "description": vulnerability.description,
        "severity": vulnerability.severity,
        "status": vulnerability.status,
        "created_at": vulnerability.created_at.isoformat(),
        "updated_at": vulnerability.updated_at.isoformat(),
    }


def dashboard_vulnerability_to_response(vulnerability: Vulnerability) -> dict:
    """Convert a vulnerability into its dashboard summary shape."""

    return {
        "id": vulnerability.id,
        "asset_name": vulnerability.asset.name,
        "asset_target": vulnerability.asset.target,
        "identifier": vulnerability.identifier,
        "title": vulnerability.title,
        "severity": vulnerability.severity,
        "updated_at": vulnerability.updated_at.isoformat(),
    }


def dashboard_scan_to_response(scan: Scan) -> dict:
    """Convert a scan plan into its dashboard summary shape."""

    return {
        "id": scan.id,
        "asset_name": scan.asset.name,
        "asset_target": scan.asset.target,
        "profile": scan.profile,
        "status": scan.status,
        "created_at": scan.created_at.isoformat(),
    }


@app.get(
    "/api/v1/dashboard/summary",
    response_model=DashboardSummaryResponse,
)
async def get_dashboard_summary_endpoint(
    db: Session = Depends(get_db),
):
    """Return a cross-module operational overview."""

    summary = get_dashboard_summary(db)

    return {
        **summary,
        "recent_vulnerabilities": [
            dashboard_vulnerability_to_response(vulnerability)
            for vulnerability in summary["recent_vulnerabilities"]
        ],
        "recent_scans": [
            dashboard_scan_to_response(scan)
            for scan in summary["recent_scans"]
        ],
    }


@app.get(
    "/api/v1/platform/status",
    response_model=PlatformStatusResponse,
)
async def get_platform_status_endpoint(
    db: Session = Depends(get_db),
):
    """Return safe platform readiness status for operators."""

    return get_platform_status(db)


@app.post(
    "/api/v1/assets",
    response_model=AssetResponse,
    status_code=201,
)
async def create_asset_endpoint(
    request: AssetCreateRequest,
    db: Session = Depends(get_db),
):
    """Create a new security asset."""

    asset = create_asset(
        db=db,
        name=request.name,
        asset_type=request.type,
        target=request.target,
        description=request.description,
    )

    return asset_to_response(asset)


@app.get(
    "/api/v1/assets",
    response_model=list[AssetResponse],
)
async def list_assets(
    db: Session = Depends(get_db),
):
    """Return all security assets."""

    assets = get_assets(db)

    return [
        asset_to_response(asset)
        for asset in assets
    ]


@app.post(
    "/api/v1/scans",
    response_model=ScanResponse,
    status_code=201,
)
async def create_scan_endpoint(
    request: ScanCreateRequest,
    db: Session = Depends(get_db),
):
    """Queue a scan plan for a tracked asset without executing it."""

    asset = get_asset(db=db, asset_id=request.asset_id)

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    scan = create_scan(
        db=db,
        asset=asset,
        profile=request.profile,
    )

    return scan_to_response(scan)


@app.get(
    "/api/v1/scans",
    response_model=list[ScanResponse],
)
async def list_scans(
    db: Session = Depends(get_db),
):
    """Return all persisted scan plans without executing them."""

    return [scan_to_response(scan) for scan in get_scans(db)]


@app.post(
    "/api/v1/vulnerabilities",
    response_model=VulnerabilityResponse,
    status_code=201,
)
async def create_vulnerability_endpoint(
    request: VulnerabilityCreateRequest,
    db: Session = Depends(get_db),
):
    """Record a vulnerability finding against a tracked asset."""

    asset = get_asset(db=db, asset_id=request.asset_id)

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    vulnerability = create_vulnerability(
        db=db,
        asset=asset,
        identifier=request.identifier,
        title=request.title,
        description=request.description,
        severity=request.severity,
    )

    return vulnerability_to_response(vulnerability)


@app.get(
    "/api/v1/vulnerabilities",
    response_model=list[VulnerabilityResponse],
)
async def list_vulnerabilities(
    db: Session = Depends(get_db),
):
    """Return all recorded vulnerability findings."""

    return [
        vulnerability_to_response(vulnerability)
        for vulnerability in get_vulnerabilities(db)
    ]


@app.patch(
    "/api/v1/vulnerabilities/{vulnerability_id}",
    response_model=VulnerabilityResponse,
)
async def update_vulnerability_status_endpoint(
    vulnerability_id: int,
    request: VulnerabilityStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    """Update a recorded vulnerability's lifecycle status."""

    vulnerability = update_vulnerability_status(
        db=db,
        vulnerability_id=vulnerability_id,
        status=request.status,
    )

    if vulnerability is None:
        raise HTTPException(
            status_code=404,
            detail="Vulnerability not found",
        )

    return vulnerability_to_response(vulnerability)


@app.get(
    "/api/v1/assets/{asset_id}",
    response_model=AssetResponse,
)
async def get_asset_endpoint(
    asset_id: int,
    db: Session = Depends(get_db),
):
    """Return a single security asset."""

    asset = get_asset(
        db=db,
        asset_id=asset_id,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    return asset_to_response(asset)


@app.put(
    "/api/v1/assets/{asset_id}",
    response_model=AssetResponse,
)
async def update_asset_endpoint(
    asset_id: int,
    request: AssetUpdateRequest,
    db: Session = Depends(get_db),
):
    """Update an existing security asset."""

    asset = update_asset(
        db=db,
        asset_id=asset_id,
        name=request.name,
        asset_type=request.type,
        target=request.target,
        description=request.description,
    )

    if asset is None:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    return asset_to_response(asset)


@app.delete(
    "/api/v1/assets/{asset_id}",
)
async def delete_asset_endpoint(
    asset_id: int,
    db: Session = Depends(get_db),
):
    """Delete an existing security asset."""

    deleted = delete_asset(
        db=db,
        asset_id=asset_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    return {
        "message": "Asset deleted successfully",
    }
