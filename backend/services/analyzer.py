from detectors.registry import DETECTORS


# Numeric values allow us to compare severity levels.
# A higher number means a more serious security finding.
SEVERITY_LEVELS = {
    "none": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
}


def get_highest_severity(severities):
    # Return the most serious severity from all detector results.
    return max(
        severities,
        key=lambda severity: SEVERITY_LEVELS[severity]
    )


def analyze_text(text):
    # Store the result returned by every detector.
    results = []

    # Run every detector registered in registry.py.
    for detector in DETECTORS:
        result = detector(text)
        results.append(result)

    # Extract the severity from each detector result.
    severities = [
        result["severity"]
        for result in results
    ]

    # Find the most serious result overall.
    severity = get_highest_severity(severities)

    # True if at least one detector detected a security issue.
    detected = any(
        result["detected"]
        for result in results
    )

    # Return the combined security analysis.
    return {
        "detected": detected,
        "severity": severity,
        "results": results
    }