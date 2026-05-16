"""
Step-by-step tests for 6E Creative Studio FastAPI backend.

Run from backend folder:
C:/Users/shsharma37/AppData/Local/Programs/Python/Python314/python.exe -m unittest -v test_backend_api.py
"""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from main import app


class TestImageBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client = TestClient(app)

    def test_step_01_home_endpoint(self) -> None:
        """Step 1: Verify API root is reachable."""
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("message", payload)
        self.assertIn("Image Backend Running", payload["message"])

    def test_step_02_generate_social_image_instagram(self) -> None:
        """Step 2: Verify social image generation for Instagram."""
        payload = {
            "platform": "Instagram",
            "campaign": "Goa summer sale",
            "audience": "Gen-Z",
            "tone": "Youthful",
        }
        response = self.client.post("/generate-social-image", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["platform"], "Instagram")
        self.assertIn("image_url", data)
        self.assertIn("pollinations.ai", data["image_url"])
        self.assertIn("insights", data)

        insights = data["insights"]
        self.assertIn("hashtags", insights)
        self.assertGreaterEqual(len(insights["hashtags"]), 1)
        self.assertIn("best_posting_windows_local", insights)
        self.assertGreaterEqual(len(insights["best_posting_windows_local"]), 1)
        self.assertIn("audience_adherence_score", insights)

    def test_step_03_platform_personality_linkedin(self) -> None:
        """Step 3: Verify platform personality changes prompt tone."""
        payload = {
            "platform": "LinkedIn",
            "campaign": "Corporate shuttle promo",
            "audience": "Business travelers",
            "tone": "Premium",
        }
        response = self.client.post("/generate-social-image", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        prompt = data["prompt"].lower()
        self.assertIn("professional corporate airline branding", prompt)
        self.assertIn("premium clean composition", prompt)

    def test_step_04_generate_banner_with_resolution(self) -> None:
        """Step 4: Verify banner endpoint includes resolution-aware image URL params."""
        payload = {
            "banner_type": "Instagram Story",
            "resolution": "1080x1920",
            "campaign_text": "Fly to Goa this summer",
            "visual_style": "Premium",
        }
        response = self.client.post("/generate-banner", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertEqual(data["resolution"], "1080x1920")
        self.assertIn("image_url", data)
        self.assertIn("width=1080", data["image_url"])
        self.assertIn("height=1920", data["image_url"])

    def test_step_05_generate_banner_with_invalid_resolution(self) -> None:
        """Step 5: Verify graceful fallback when resolution cannot be parsed."""
        payload = {
            "banner_type": "Homepage Hero",
            "resolution": "invalid",
            "campaign_text": "Monsoon offer",
            "visual_style": "Cinematic",
        }
        response = self.client.post("/generate-banner", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["success"])
        self.assertIn("image_url", data)
        self.assertNotIn("width=", data["image_url"])
        self.assertNotIn("height=", data["image_url"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
