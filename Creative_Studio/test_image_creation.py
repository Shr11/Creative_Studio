"""
Test image creation using Azure OpenAI credentials from .env
"""

import os
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

API_KEY: str = os.environ["AZURE_OPENAI_API_KEY"]
ENDPOINT: str = os.environ["AZURE_OPENAI_ENDPOINT"]
DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-image-1")
API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2025-04-01-preview")


def validate_config() -> None:
    # Most 404 issues here are caused by using a chat deployment or an old API version.
    if "image" not in DEPLOYMENT.lower():
        print(
            "Config issue: AZURE_OPENAI_DEPLOYMENT looks non-image "
            f"('{DEPLOYMENT}'). Use an image deployment like 'gpt-image-1'."
        )
        raise SystemExit(1)

    if API_VERSION != "2025-04-01-preview":
        print(
            "Config issue: AZURE_OPENAI_API_VERSION should be "
            "'2025-04-01-preview' for this Responses API image test. "
            f"Current value: '{API_VERSION}'"
        )
        raise SystemExit(1)

# ---------------------------------------------------------------------------
# Build the request
# The Azure OpenAI Responses API supports image generation.
# Endpoint format:
#   https://<resource>.openai.azure.com/openai/responses?api-version=...
# ---------------------------------------------------------------------------

request_url = f"{ENDPOINT.rstrip('/')}/openai/responses?api-version={API_VERSION}"

headers = {
    "api-key": API_KEY,
    "Content-Type": "application/json",
}

payload = {
    "model": DEPLOYMENT,
    "input": "A futuristic city skyline at sunset with flying cars",
    "modalities": ["text", "image"],
}

validate_config()

print(f"Sending image generation request to:\n  {request_url}\n")

response = requests.post(request_url, headers=headers, json=payload, timeout=120)

if response.status_code != 200:
    print(f"Error {response.status_code}: {response.text}")
    raise SystemExit(1)

data = response.json()

# ---------------------------------------------------------------------------
# Save any image output(s) returned in the response
# ---------------------------------------------------------------------------
output_dir = Path("output_images")
output_dir.mkdir(exist_ok=True)

images_saved = 0
for item in data.get("output", []):
    for content in item.get("content", []):
        if content.get("type") == "image_url":
            img_url = content["image_url"]["url"]
            if img_url.startswith("data:image"):
                # Base-64 encoded inline image
                header, b64data = img_url.split(",", 1)
                ext = header.split("/")[1].split(";")[0]  # e.g. "png"
                img_bytes = base64.b64decode(b64data)
            else:
                # Remote URL – download it
                img_resp = requests.get(img_url, timeout=60)
                img_resp.raise_for_status()
                img_bytes = img_resp.content
                ext = "png"

            out_path = output_dir / f"generated_image_{images_saved + 1}.{ext}"
            out_path.write_bytes(img_bytes)
            print(f"Image saved: {out_path}")
            images_saved += 1

if images_saved == 0:
    print("No images found in response. Full response:")
    import json
    print(json.dumps(data, indent=2))
else:
    print(f"\n{images_saved} image(s) saved to '{output_dir}/'")
