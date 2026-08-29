import json

from sqlalchemy.orm import Session

from db.models import Analysis, AnalysisResult


def save_analysis(
    db: Session,
    text: str,
    security_analysis: dict,
) -> Analysis:
    """
    Save a complete Ceron security analysis and its detector results.
    """

    # Create the main analysis record.
    analysis = Analysis(
        text=text,
        severity=security_analysis["severity"],
    )

    # Add it to the current database session.
    db.add(analysis)

    # Flush so PostgreSQL/SQLAlchemy assigns the analysis ID.
    db.flush()

    # Save each individual detector result.
    for result in security_analysis["results"]:
        categories = result.get("categories")

        # The database stores categories as JSON text.
        if categories:
            categories_value = json.dumps(categories)
        else:
            categories_value = None

        analysis_result = AnalysisResult(
            analysis_id=analysis.id,
            detected=result["detected"],
            type=result["type"],
            severity=result["severity"],
            categories=categories_value,
        )

        db.add(analysis_result)

    # Commit the analysis and all detector results.
    db.commit()

    # Refresh the object so it contains the latest database state.
    db.refresh(analysis)

    return analysis