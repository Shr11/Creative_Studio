"""
Negative validation tests for 6E Creative Studio FastAPI backend.

Run from backend folder:
C:/Users/shsharma37/AppData/Local/Programs/Python/Python314/python.exe -m unittest -v test_backend_api_validation.py
"""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from main import app


class TestImageBackendValidation(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_social_missing_required_field_platform(self) -> None:
        payload = {
            "campaign": "Goa sale",
            "audience": "Gen-Z",
            "tone": "Youthful",
        }

        response = self.client.post("/generate-social-image", json=payload)

        self.assertEqual(response.status_code, 422)
        errors = response.json().get("detail", [])
        self.assertTrue(any(err.get("loc", [])[-1] == "platform" for err in errors))

    def test_social_missing_multiple_required_fields(self) -> None:
        payload = {
            "platform": "Instagram",
        }

        response = self.client.post("/generate-social-image", json=payload)

        self.assertEqual(response.status_code, 422)
        errors = response.json().get("detail", [])
        missing_fields = {
            err.get("loc", [])[-1]
            for err in errors
            if isinstance(err.get("loc"), list) and err.get("loc")
        }
        self.assertIn("campaign", missing_fields)
        self.assertIn("audience", missing_fields)
        self.assertIn("tone", missing_fields)

    def test_social_wrong_type_for_platform(self) -> None:
        payload = {
            "platform": 123,
            "campaign": "Goa sale",
            "audience": "Gen-Z",
            "tone": "Youthful",
        }

        response = self.client.post("/generate-social-image", json=payload)

        self.assertEqual(response.status_code, 422)
        errors = response.json().get("detail", [])
        self.assertTrue(any(err.get("loc", [])[-1] == "platform" for err in errors))

    def test_banner_missing_required_resolution(self) -> None:
        payload = {
            "banner_type": "Instagram Story",
            "campaign_text": "Fly this summer",
            "visual_style": "Premium",
        }

        response = self.client.post("/generate-banner", json=payload)

        self.assertEqual(response.status_code, 422)
        errors = response.json().get("detail", [])
        self.assertTrue(any(err.get("loc", [])[-1] == "resolution" for err in errors))

    def test_banner_wrong_type_for_resolution(self) -> None:
        payload = {
            "banner_type": "Instagram Story",
            "resolution": 10801920,
            "campaign_text": "Fly this summer",
            "visual_style": "Premium",
        }

        response = self.client.post("/generate-banner", json=payload)

        self.assertEqual(response.status_code, 422)
        errors = response.json().get("detail", [])
        self.assertTrue(any(err.get("loc", [])[-1] == "resolution" for err in errors))


if __name__ == "__main__":
    unittest.main(verbosity=2)
