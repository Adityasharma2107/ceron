from detectors.registry import DETECTORS


SEVERITY_LEVELS = {
    "none": 0,
    "low": 1,
    "medium": 2,
    "high": 3,
}


def get_highest_severity(severities):
    return max(severities, key=lambda severity: SEVERITY_LEVELS[severity])


def analyze_text(text):
    results = []

    for detector in DETECTORS:
        result = detector(text)
        results.append(result)

    severities = [
        result["severity"]
        for result in results
    ]

    severity = get_highest_severity(severities)

    detected = any(
        result["detected"]
        for result in results
    )

    return {
        "detected": detected,
        "severity": severity,
        "results": results
    }
