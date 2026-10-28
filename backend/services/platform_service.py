from sqlalchemy import text
from sqlalchemy.orm import Session


def get_platform_status(db: Session) -> dict:
    """Return safe operational status without exposing configuration secrets."""

    db.execute(text("SELECT 1"))

    return {
        "api_status": "operational",
        "database_status": "connected",
        "analysis_engine": "deterministic",
        "scan_execution_enabled": False,
        "authentication_enabled": False,
    }
