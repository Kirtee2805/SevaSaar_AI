import re
from typing import Literal

LanguageCode = Literal["en", "hi", "gu", "mixed"]

LANGUAGE_HINTS = {
    "gu": "gu-IN",
    "hi": "hi-IN",
    "en": "en-IN",
    "mixed": "hi-IN"
}

# Unicode regex ranges
GUJARATI_PATTERN = re.compile(r"[\u0A80-\u0AFF]")
DEVANAGARI_PATTERN = re.compile(r"[\u0900-\u097F]")
LATIN_PATTERN = re.compile(r"[a-zA-Z]")

# Common Hindi/Gujarati transliterated medical / communicative keywords in Latin script (Hinglish/Gujlish)
ROMANIZED_KEYWORDS = [
    "dard", "dukhavo", "chhati", "saans", "shwas", "bukhar", "taav", "khansi", "udhras",
    "chakkar", "kamjori", "pait", "dava", "tablet", "karta", "hota", "che", "hai",
    "tha", "thi", "gaya", "aavyo", "din", "divas", "hafte", "mahina"
]

def detect_language(text: str) -> LanguageCode:
    """
    Detects language or code-switching in patient input.
    Supports Gujarati, Hindi, English, and Romanized Mixed code-switching (Hinglish / Gujlish).
    """
    if not text or not text.strip():
        return "mixed"

    normalized = text.strip().lower()

    has_gujarati = bool(GUJARATI_PATTERN.search(normalized))
    has_hindi = bool(DEVANAGARI_PATTERN.search(normalized))
    has_latin = bool(LATIN_PATTERN.search(normalized))

    # Multiple native scripts present => mixed
    if (has_gujarati and has_hindi) or (has_gujarati and has_latin) or (has_hindi and has_latin):
        return "mixed"

    if has_gujarati:
        return "gu"

    if has_hindi:
        return "hi"

    # Only Latin script present
    if has_latin:
        # Check if Romanized Hindi/Gujarati words exist
        words = set(re.findall(r"\b[a-z]+\b", normalized))
        is_romanized_mixed = any(w in words for w in ROMANIZED_KEYWORDS)
        if is_romanized_mixed:
            return "mixed"
        return "en"

    return "mixed"

def get_bcp47_tag(lang: LanguageCode) -> str:
    return LANGUAGE_HINTS.get(lang, "en-IN")

