from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class Analysis(Base):
    """Stores a security analysis performed by Ceron."""

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    results: Mapped[list["AnalysisResult"]] = relationship(
        back_populates="analysis",
        cascade="all, delete-orphan",
    )


class AnalysisResult(Base):
    """Stores the result produced by an individual security detector."""

    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
    )

    detected: Mapped[bool] = mapped_column(
        nullable=False,
    )

    type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    categories: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    analysis: Mapped["Analysis"] = relationship(
        back_populates="results",
    )