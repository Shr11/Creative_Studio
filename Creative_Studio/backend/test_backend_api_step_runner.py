"""
Step-by-step backend API feature tester with readable logs.

Run from project root:
C:/Users/shsharma37/AppData/Local/Programs/Python/Python314/python.exe backend/test_backend_api_step_runner.py

Run from backend folder:
C:/Users/shsharma37/AppData/Local/Programs/Python/Python314/python.exe test_backend_api_step_runner.py
"""

from __future__ import annotations

import json
import sys
from typing import Any

from fastapi.testclient import TestClient

from main import app


def _print_header(title: str) -> None:
    print("\n" + "=" * 72)
    print(title)
    print("=" * 72)


def _print_step(step_number: int, title: str) -> None:
    print(f"\n[STEP {step_number}] {title}")


def _print_pass() -> None:
    print("RESULT: PASS")


def _print_fail(message: str) -> None:
    print(f"RESULT: FAIL - {message}")


def _excerpt(payload: dict[str, Any], keys: list[str]) -> dict[str, Any]:
    return {key: payload.get(key) for key in keys}


def run_steps() -> int:
    client = TestClient(app)
    failures = 0

    _print_header("6E Creative Studio Backend API - Step Runner")

    # Step 1: Home endpoint
    _print_step(1, "Check health endpoint GET /")
    response = client.get("/")
    print(f"HTTP {response.status_code}")
    print(f"Body: {response.json()}")
    if response.status_code == 200 and "message" in response.json():
        _print_pass()
    else:
        _print_fail("Health endpoint did not return expected payload")
        failures += 1

    # Step 2: Social generation for Instagram
    _print_step(2, "Generate social image for Instagram")
    social_payload = {
        "platform": "Instagram",
        "campaign": "Goa summer sale",
        "audience": "Gen-Z",
        "tone": "Youthful",
    }
    response = client.post("/generate-social-image", json=social_payload)
    print(f"HTTP {response.status_code}")
    social_data = response.json()
    print("Response excerpt:")
    print(
        json.dumps(
            _excerpt(social_data, ["success", "platform", "image_url"]),
            indent=2,
        )
    )

    insights = social_data.get("insights", {}) if isinstance(social_data, dict) else {}
    print("Insights excerpt:")
    print(
        json.dumps(
            {
                "hashtags": insights.get("hashtags", []),
                "best_posting_windows_local": insights.get("best_posting_windows_local", []),
                "audience_adherence_score": insights.get("audience_adherence_score"),
            },
            indent=2,
        )
    )

    if (
        response.status_code == 200
        and social_data.get("success") is True
        and "pollinations.ai" in social_data.get("image_url", "")
        and isinstance(insights.get("hashtags", []), list)
    ):
        _print_pass()
    else:
        _print_fail("Social generation response did not match expected structure")
        failures += 1

    # Step 3: Platform personality difference
    _print_step(3, "Validate platform personality prompt for LinkedIn")
    linkedin_payload = {
        "platform": "LinkedIn",
        "campaign": "Corporate route optimization",
        "audience": "Business travelers",
        "tone": "Premium",
    }
    response = client.post("/generate-social-image", json=linkedin_payload)
    print(f"HTTP {response.status_code}")
    linkedin_data = response.json()
    prompt = linkedin_data.get("prompt", "")
    print("Prompt excerpt:")
    print(prompt[:350] + ("..." if len(prompt) > 350 else ""))

    if (
        response.status_code == 200
        and "professional corporate airline branding" in prompt.lower()
        and "premium clean composition" in prompt.lower()
    ):
        _print_pass()
    else:
        _print_fail("LinkedIn personality markers not found in prompt")
        failures += 1

    # Step 4: Banner generation with resolution
    _print_step(4, "Generate banner with resolution 1080x1920")
    banner_payload = {
        "banner_type": "Instagram Story",
        "resolution": "1080x1920",
        "campaign_text": "Fly to Goa this summer",
        "visual_style": "Premium",
    }
    response = client.post("/generate-banner", json=banner_payload)
    print(f"HTTP {response.status_code}")
    banner_data = response.json()
    print("Response excerpt:")
    print(
        json.dumps(
            _excerpt(banner_data, ["success", "resolution", "image_url"]),
            indent=2,
        )
    )

    image_url = banner_data.get("image_url", "")
    if (
        response.status_code == 200
        and banner_data.get("success") is True
        and "width=1080" in image_url
        and "height=1920" in image_url
    ):
        _print_pass()
    else:
        _print_fail("Banner URL is missing expected width/height query parameters")
        failures += 1

    # Step 5: Validation check (missing required field)
    _print_step(5, "Validation: send invalid social payload (missing platform)")
    invalid_payload = {
        "campaign": "Festival sale",
        "audience": "Family",
        "tone": "Warm",
    }
    response = client.post("/generate-social-image", json=invalid_payload)
    print(f"HTTP {response.status_code}")
    error_data = response.json()
    print("Validation error excerpt:")
    print(json.dumps(error_data.get("detail", [])[:2], indent=2))

    if response.status_code == 422:
        _print_pass()
    else:
        _print_fail("Invalid payload should return 422")
        failures += 1

    _print_header("Final Summary")
    total_steps = 5
    passed_steps = total_steps - failures
    print(f"Total steps: {total_steps}")
    print(f"Passed: {passed_steps}")
    print(f"Failed: {failures}")

    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(run_steps())
