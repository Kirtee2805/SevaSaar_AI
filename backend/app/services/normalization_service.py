import re
import unicodedata

def normalize_text(text: str) -> str:
    """
    Cleans and normalizes patient complaint text across Gujarati, Hindi, English, and Hinglish.
    - Normalizes Unicode characters (NFC)
    - Removes zero-width joiners / non-printable characters
    - Normalizes multiple spaces, tabs, and line breaks
    """
    if not text:
        return ""

    # Unicode normalization
    text = unicodedata.normalize("NFC", text)

    # Strip control and zero-width characters (except valid newlines and spaces)
    text = re.sub(r"[\u200B-\u200D\uFEFF]", "", text)

    # Replace multiple whitespaces and tabs with a single space
    text = re.sub(r"[ \t]+", " ", text)

    # Replace 3+ consecutive newlines with 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()

