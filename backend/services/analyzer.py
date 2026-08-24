from detectors.prompt_injection import detect_prompt_injection


def analyze_text(text):
    prompt_injection_result = detect_prompt_injection(text)

    return {
        "detected": prompt_injection_result["detected"],
        "results": [
            prompt_injection_result
        ]
    }


