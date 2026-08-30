from sqlalchemy.orm import Session

from db.models import Asset


def create_asset(
    db: Session,
    name: str,
    asset_type: str,
    target: str,
    description: str | None = None,
) -> Asset:
    """Create and persist a new Ceron asset."""

    asset = Asset(
        name=name,
        type=asset_type,
        target=target,
        description=description,
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset


def get_asset(
    db: Session,
    asset_id: int,
) -> Asset | None:
    """Return a single asset by ID."""

    return db.get(Asset, asset_id)


def get_assets(
    db: Session,
) -> list[Asset]:
    """Return all assets."""

    return (
        db.query(Asset)
        .order_by(Asset.id.desc())
        .all()
    )


def update_asset(
    db: Session,
    asset_id: int,
    name: str | None = None,
    asset_type: str | None = None,
    target: str | None = None,
    description: str | None = None,
) -> Asset | None:
    """Update an existing asset."""

    asset = db.get(Asset, asset_id)

    if asset is None:
        return None

    if name is not None:
        asset.name = name

    if asset_type is not None:
        asset.type = asset_type

    if target is not None:
        asset.target = target

    if description is not None:
        asset.description = description

    db.commit()
    db.refresh(asset)

    return asset


def delete_asset(
    db: Session,
    asset_id: int,
) -> bool:
    """Delete an asset by ID."""

    asset = db.get(Asset, asset_id)

    if asset is None:
        return False

    db.delete(asset)
    db.commit()

    return True