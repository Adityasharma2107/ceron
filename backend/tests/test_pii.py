from detectors.pii import detect_pii


def test_no_pii():
    # Normal text should not trigger the PII detector.
    result = detect_pii("Hello Ceron")

    assert result["detected"] is False
    assert result["severity"] == "none"
    assert result["categories"] == []


def test_email_detection():
    # Email addresses should be detected as medium severity PII.
    result = detect_pii("Contact me at test@example.com")

    assert result["detected"] is True
    assert result["type"] == "pii"
    assert result["severity"] == "medium"
    assert "email" in result["categories"]


def test_phone_detection():
    # Indian mobile numbers should be detected as medium severity PII.
    result = detect_pii("Call me at +91 9876543210")

    assert result["detected"] is True
    assert result["severity"] == "medium"
    assert "phone" in result["categories"]


def test_ip_detection():
    # IP addresses are treated as low severity PII.
    result = detect_pii("Server IP: 192.168.1.20")

    assert result["detected"] is True
    assert result["severity"] == "low"
    assert "ip_address" in result["categories"]


def test_credit_card_detection():
    # Credit-card-like numbers are treated as high severity PII.
    result = detect_pii("Card: 4111 1111 1111 1111")

    assert result["detected"] is True
    assert result["severity"] == "high"
    assert "credit_card" in result["categories"]


def test_multiple_pii_categories():
    # Multiple PII categories can be detected in one input.
    result = detect_pii(
        "Email: test@example.com IP: 192.168.1.20"
    )

    assert result["detected"] is True
    assert result["severity"] == "medium"
    assert "email" in result["categories"]
    assert "ip_address" in result["categories"]