from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from image_engine import generate_image
from prompt_builder import (
    build_banner_prompt,
    build_social_insights,
    build_social_prompt,
)

app = FastAPI(title="6E Creative Studio Image Backend", version="1.0.0")


class SocialImageRequest(BaseModel):
    platform: str = Field(..., examples=["Instagram"])
    campaign: str = Field(..., examples=["Goa summer sale"])
    audience: str = Field(..., examples=["Gen-Z"])
    tone: str = Field(..., examples=["Youthful"])


class BannerRequest(BaseModel):
    banner_type: str = Field(..., examples=["Instagram Story"])
    resolution: str = Field(..., examples=["1080x1920"])
    campaign_text: str = Field(..., examples=["Fly to Goa this summer"])
    visual_style: str = Field(..., examples=["Premium"])


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "6E Creative Studio Image Backend Running"}


@app.post("/generate-social-image")
def generate_social_image(data: SocialImageRequest) -> dict:
    payload = data.model_dump()
    prompt = build_social_prompt(payload)
    image_url = generate_image(prompt)
    insights = build_social_insights(
        platform=data.platform,
        campaign=data.campaign,
        audience=data.audience,
        tone=data.tone,
    )

    return {
        "success": True,
        "platform": data.platform,
        "prompt": prompt,
        "image_url": image_url,
        "insights": insights,
    }


@app.post("/generate-banner")
def generate_banner(data: BannerRequest) -> dict:
    prompt = build_banner_prompt(
        banner_type=data.banner_type,
        resolution=data.resolution,
        campaign_text=data.campaign_text,
        visual_style=data.visual_style,
    )

    image_url = generate_image(prompt, resolution=data.resolution)

    return {
        "success": True,
        "resolution": data.resolution,
        "prompt": prompt,
        "image_url": image_url,
    }
