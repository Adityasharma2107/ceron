from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Literal

from db.database import get_db
from services.analysis_service import save_analysis
from services.analyzer import analyze_text


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


class AnalysisRequest(BaseModel):
    """Request body for security analysis."""

    # Text that Ceron will analyze.
    # Minimum: 1 character.
    # Maximum: 10,000 characters.
    text: str = Field(
        min_length=1,
        max_length=10000,
    )


class DetectorResult(BaseModel):
    """Result produced by an individual security detector."""

    detected: bool

    # Detector type, or None when nothing was detected.
    type: Literal["prompt_injection", "pii"] | None

    # Severity assigned by the detector.
    severity: Literal["none", "low", "medium", "high"]

    # PII categories such as email or phone.
    categories: list[str] | None = None


class SecurityAnalysis(BaseModel):
    """Combined security analysis from all detectors."""

    detected: bool

    # Highest severity across all detectors.
    severity: Literal["none", "low", "medium", "high"]

    # Results from every registered detector.
    results: list[DetectorResult]


class AnalysisResponse(BaseModel):
    """Response returned by the analysis endpoint."""

    # Original text sent by the client.
    text: str

    # Combined security analysis.
    security_analysis: SecurityAnalysis


@app.post(
    "/api/v1/analyze",
    response_model=AnalysisResponse,
)
async def analyze(
    request: AnalysisRequest,
    db: Session = Depends(get_db),
):
    """Analyze text and persist the complete security analysis."""

    # Run Ceron's security detectors.
    result = analyze_text(request.text)

    # Save the analysis and all individual detector results.
    save_analysis(
        db=db,
        text=request.text,
        security_analysis=result,
    )

    # Return the same API response as before.
    return {
        "text": request.text,
        "security_analysis": result,
    }