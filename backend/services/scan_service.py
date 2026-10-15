from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from db.models import Asset, Scan


def create_scan(
    db: Session,
    asset: Asset,
    profile: str,
) -> Scan:
    """Persist a scan plan for an existing asset."""

    scan = Scan(
        asset=asset,
        profile=profile,
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return scan


def get_scans(db: Session) -> list[Scan]:
    """Return scan plans with their linked assets."""

    statement = (
        select(Scan)
        .options(joinedload(Scan.asset))
        .order_by(Scan.created_at.desc(), Scan.id.desc())
    )

    return list(db.scalars(statement))
