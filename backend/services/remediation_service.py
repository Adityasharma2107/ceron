import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models import Analysis, AnalysisResult


SEVERITY_ORDER = {
    "none": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
}

REMEDIATION_DETAILS = {
    "prompt_injection": {
        "title": "Strengthen prompt-injection defenses",
        "description": (
            "Untrusted input attempted to override system instructions or "
            "request protected information."
        ),
        "actions": [
            "Keep system instructions separate from untrusted user input.",
            "Validate tool requests against an allowlist before execution.",
            "Record the attempt and review recurring attack patterns.",
        ],
    },
    "pii": {
        "title": "Protect detected personal data",
        "description": (
            "Potential personally identifiable information was found in "
            "content submitted for analysis."
        ),
        "actions": [
            "Minimize collection and retention of the detected data.",
            "Redact sensitive fields before sharing content with external services.",
            "Confirm access controls and audit logging for affected systems.",
        ],
    },
}


def parse_categories(value: str | None) -> list[str]:
    """Return stored detector categories while tolerating historical values."""

    if not value:
        return []

    try:
        categories = json.loads(value)
    except json.JSONDecodeError:
        return []

    return categories if isinstance(categories, list) else []


def get_remediation_recommendations(db: Session) -> list[dict]:
    """Aggregate actionable recommendations from persisted detected results."""

    rows = db.execute(
        select(AnalysisResult, Analysis.created_at)
        .join(Analysis, AnalysisResult.analysis_id == Analysis.id)
        .where(AnalysisResult.detected.is_(True))
        .order_by(Analysis.created_at.desc())
    ).all()

    recommendations: dict[str, dict] = {}

    for result, created_at in rows:
        detector_type = result.type or "unknown"
        details = REMEDIATION_DETAILS.get(
            detector_type,
            {
                "title": "Review security detector finding",
                "description": "A security detector reported a finding requiring review.",
                "actions": [
                    "Review the detector finding and its surrounding context.",
                    "Apply an appropriate control before processing similar input again.",
                ],
            },
        )
        recommendation = recommendations.setdefault(
            detector_type,
            {
                "id": detector_type,
                "title": details["title"],
                "description": details["description"],
                "priority": result.severity,
                "actions": details["actions"],
                "categories": set(),
                "affected_analyses": set(),
                "last_detected_at": created_at,
            },
        )

        if SEVERITY_ORDER[result.severity] > SEVERITY_ORDER[recommendation["priority"]]:
            recommendation["priority"] = result.severity

        recommendation["categories"].update(parse_categories(result.categories))
        recommendation["affected_analyses"].add(result.analysis_id)

        if created_at > recommendation["last_detected_at"]:
            recommendation["last_detected_at"] = created_at

    return [
        {
            "id": recommendation["id"],
            "title": recommendation["title"],
            "description": recommendation["description"],
            "priority": recommendation["priority"],
            "actions": recommendation["actions"],
            "categories": sorted(recommendation["categories"]),
            "affected_analyses": len(recommendation["affected_analyses"]),
            "last_detected_at": recommendation["last_detected_at"].isoformat(),
        }
        for recommendation in sorted(
            recommendations.values(),
            key=lambda recommendation: (
                SEVERITY_ORDER[recommendation["priority"]],
                recommendation["last_detected_at"],
            ),
            reverse=True,
        )
    ]
