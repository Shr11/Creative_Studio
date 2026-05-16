from __future__ import annotations

from urllib.parse import quote, urlencode


def generate_image(prompt: str, resolution: str | None = None) -> str:
    encoded_prompt = quote(prompt)
    base_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"

    if not resolution:
        return base_url

    width, height = _parse_resolution(resolution)
    if width is None or height is None:
        return base_url

    query = urlencode({"width": width, "height": height})
    return f"{base_url}?{query}"


def _parse_resolution(resolution: str) -> tuple[int | None, int | None]:
    cleaned = resolution.lower().replace(" ", "")
    if "x" not in cleaned:
        return None, None

    try:
        width_s, height_s = cleaned.split("x", maxsplit=1)
        return int(width_s), int(height_s)
    except ValueError:
        return None, None
