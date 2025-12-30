def validate_non_empty(text: str) -> bool:
    """Check if text is not None and not just whitespace."""
    return bool(text and text.strip())

def validate_id(id_str: str) -> bool:
    """Check if string is a valid positive integer ID."""
    return id_str.isdigit() and int(id_str) > 0
