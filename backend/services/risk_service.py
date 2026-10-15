from sqlalchemy import func, select
from sqlalchemy.orm import Session

from db.models import Analysis, Asset


SEVERITY_ORDER = {
    "none": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
}


def get_risk_summary(db: Session) -> dict:
    """Summarize the risk posture represented by persisted analyses."""

    severity_counts = {
        "none": 0,
        "low": 0,
        "medium": 0,
        "high": 0,
    }

    severity_rows = db.execute(
        select(Analysis.severity, func.count(Analysis.id))
        .group_by(Analysis.severity)
    ).all()

    for severity, count in severity_rows:
        if severity in severity_counts:
            severity_counts[severity] = count

    total_assets = db.scalar(select(func.count(Asset.id))) or 0
    total_analyses = sum(severity_counts.values())
    detected_analyses = sum(
        count
        for severity, count in severity_counts.items()
        if severity != "none"
    )
    overall_severity = max(
        severity_counts,
        key=lambda severity: (
            SEVERITY_ORDER[severity]
            if severity_counts[severity] > 0
            else -1
        ),
        default="none",
    )

    return {
        "total_assets": total_assets,
        "total_analyses": total_analyses,
        "detected_analyses": detected_analyses,
        "overall_severity": overall_severity,
        "severity_counts": severity_counts,
    }
