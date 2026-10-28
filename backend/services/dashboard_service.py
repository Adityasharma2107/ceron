from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from db.models import Scan, Vulnerability
from services.risk_service import get_risk_summary


def get_dashboard_summary(db: Session) -> dict:
    """Build an operational overview from Ceron's persisted platform data."""

    risk_summary = get_risk_summary(db)
    queued_scans = db.scalar(
        select(func.count(Scan.id)).where(Scan.status == "queued")
    ) or 0
    open_vulnerabilities = db.scalar(
        select(func.count(Vulnerability.id)).where(
            Vulnerability.status == "open"
        )
    ) or 0
    critical_vulnerabilities = db.scalar(
        select(func.count(Vulnerability.id)).where(
            Vulnerability.status == "open",
            Vulnerability.severity == "critical",
        )
    ) or 0
    recent_vulnerabilities = db.scalars(
        select(Vulnerability)
        .options(joinedload(Vulnerability.asset))
        .where(Vulnerability.status == "open")
        .order_by(Vulnerability.updated_at.desc(), Vulnerability.id.desc())
        .limit(5)
    ).all()
    recent_scans = db.scalars(
        select(Scan)
        .options(joinedload(Scan.asset))
        .order_by(Scan.created_at.desc(), Scan.id.desc())
        .limit(5)
    ).all()

    return {
        "total_assets": risk_summary["total_assets"],
        "total_analyses": risk_summary["total_analyses"],
        "detected_analyses": risk_summary["detected_analyses"],
        "overall_severity": risk_summary["overall_severity"],
        "queued_scans": queued_scans,
        "open_vulnerabilities": open_vulnerabilities,
        "critical_vulnerabilities": critical_vulnerabilities,
        "recent_vulnerabilities": recent_vulnerabilities,
        "recent_scans": recent_scans,
    }
