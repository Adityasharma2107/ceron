from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

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
    # Text that Ceron will analyze.
    # Minimum: 1 character
    # Maximum: 10,000 characters
    text: str = Field(
        min_length=1,
        max_length=10000
    )

class DetectorResult(BaseModel):
    # Whether this detector found a security issue.
    detected: bool

    # Detector type, or None when nothing was detected.
    type: Literal["prompt_injection", "pii"] | None

    # Severity assigned by the detector.
    severity: Literal["none", "low", "medium", "high"]

    # PII categories such as email or phone.
    categories: list[str] | None = None


class SecurityAnalysis(BaseModel):
    # Whether any detector found a security issue.
    detected: bool

    # Highest severity across all detectors.
    severity: Literal["none", "low", "medium", "high"]

    # Results from every registered detector.
    results: list[DetectorResult]


class AnalysisResponse(BaseModel):
    # Original text sent by the client.
    text: str

    # Combined security analysis.
    security_analysis: SecurityAnalysis


@app.post(
    "/api/v1/analyze",
    response_model=AnalysisResponse
)
async def analyze(request: AnalysisRequest):
    result = analyze_text(request.text)

    return {
        "text": request.text,
        "security_analysis": result
    }