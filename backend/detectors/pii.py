# PII = Personally Identifiable Information.
# It's information that can identify, contact, or meaningfully relate to a person.


import re


# Regex patterns used to identify common PII.
EMAIL_PATTERN = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"

PHONE_PATTERN = r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)"

IP_PATTERN = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"

CREDIT_CARD_PATTERN = r"(?<!\d)(?:\d{4}[\s-]?){3}\d{4}(?!\d)"


def detect_pii(text):
    # Store every PII category found in the input.
    categories = []

    # Default severity when no PII is detected.
    severity = "none"

    # Check for an email address.
    if re.search(EMAIL_PATTERN, text):
        categories.append("email")
        severity = "medium"

    # Check for an Indian mobile phone number.
    if re.search(PHONE_PATTERN, text):
        categories.append("phone")
        severity = "medium"

    # Check for an IP address.
    if re.search(IP_PATTERN, text):
        categories.append("ip_address")

        # Only change severity if nothing more serious was found.
        if severity == "none":
            severity = "low"

    # Check for a credit-card-like number.
    if re.search(CREDIT_CARD_PATTERN, text):
        categories.append("credit_card")

        # Credit-card-like data is treated as high severity.
        severity = "high"

    # No PII was found.
    if not categories:
        return {
            "detected": False,
            "type": None,
            "severity": "none",
            "categories": []
        }

    # Return the combined PII detection result.
    return {
        "detected": True,
        "type": "pii",
        "severity": severity,
        "categories": categories
    }