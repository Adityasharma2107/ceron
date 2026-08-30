from typing import Literal

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Asset, Analysis
from services.analyzer import analyze_text
from services.asset_service import (
    create_asset,
    delete_asset,
    get_asset,
    get_assets,
    update_asset,
)


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

    analysis = Analysis(
        text=request.text,
        severity=result["severity"],
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "text": request.text,
        "security_analysis": result,
    }


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