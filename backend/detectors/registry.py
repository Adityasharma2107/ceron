from detectors.prompt_injection import detect_prompt_injection
from detectors.pii import detect_pii


# Every detector added here will automatically
# be executed by the analyzer.
DETECTORS = [
    detect_prompt_injection,
    detect_pii
]