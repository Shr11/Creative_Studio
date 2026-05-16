from __future__ import annotations

from datetime import datetime
from typing import Any


PLATFORM_PERSONALITIES = {
    "Instagram": {
        "style": "vibrant Gen-Z aesthetic, cinematic lighting, trendy travel vibe, social media ad",
        "color_palette": "electric blue, coral, warm sunset orange",
        "composition": "dynamic close-ups, motion blur accents, hero subject centered",
        "typography_vibe": "bold modern sans-serif with playful punch",
        "realism": "ultra-realistic with glossy ad finish",
        "mood": "youthful, aspirational, energetic",
    },
    "LinkedIn": {
        "style": "professional corporate airline branding, premium clean composition, business aesthetic",
        "color_palette": "deep navy, white, steel gray",
        "composition": "clean grid, negative space, executive-travel context",
        "typography_vibe": "minimal premium sans-serif, highly legible",
        "realism": "photo-real with understated polish",
        "mood": "confident, credible, premium",
    },
    "Facebook": {
        "style": "family-friendly travel campaign, emotional warm visuals, community-focused",
        "color_palette": "sky blue, warm gold, soft white",
        "composition": "wide relatable scenes, smiling groups, destination depth",
        "typography_vibe": "friendly rounded sans-serif",
        "realism": "warm realistic lifestyle photography",
        "mood": "welcoming, trustworthy, emotional",
    },
    "X": {
        "style": "minimal viral marketing visual, bold typography, modern social ad",
        "color_palette": "high-contrast blue, black, white",
        "composition": "single striking focal element, fast-scrolling impact",
        "typography_vibe": "sharp bold sans-serif, headline-first",
        "realism": "stylized-realistic hybrid",
        "mood": "urgent, clever, trend-driven",
    },
    "Twitter/X": {
        "style": "minimal viral marketing visual, bold typography, modern social ad",
        "color_palette": "high-contrast blue, black, white",
        "composition": "single striking focal element, fast-scrolling impact",
        "typography_vibe": "sharp bold sans-serif, headline-first",
        "realism": "stylized-realistic hybrid",
        "mood": "urgent, clever, trend-driven",
    },
    "YouTube": {
        "style": "high engagement thumbnail style, cinematic composition",
        "color_palette": "indigo blue, bright white, accent yellow",
        "composition": "dramatic perspective, clear subject separation",
        "typography_vibe": "large punchy thumbnail text style",
        "realism": "cinematic realism",
        "mood": "high-energy, curiosity-driven",
    },
}


def _platform_settings(platform: str) -> dict[str, str]:
    return PLATFORM_PERSONALITIES.get(
        platform,
        {
            "style": "modern airline marketing",
            "color_palette": "IndiGo blue and white",
            "composition": "balanced premium advertising layout",
            "typography_vibe": "clean contemporary sans-serif",
            "realism": "ultra realistic",
            "mood": "premium and optimistic",
        },
    )


def build_social_prompt(data: dict[str, Any]) -> str:
    platform = data["platform"]
    campaign = data["campaign"]
    audience = data["audience"]
    tone = data["tone"]

    settings = _platform_settings(platform)

    return f"""
Create a high-quality airline campaign image.

Platform:
{platform}

Campaign:
{campaign}

Audience:
{audience}

Tone:
{tone}

Style:
{settings['style']}

Color palette:
{settings['color_palette']}

Composition:
{settings['composition']}

Typography vibe:
{settings['typography_vibe']}

Realism:
{settings['realism']}

Mood:
{settings['mood']}

IndiGo Airlines branding.
Blue and white brand anchors.
Premium advertising quality.
""".strip()


def build_banner_prompt(
    banner_type: str,
    resolution: str,
    campaign_text: str,
    visual_style: str,
) -> str:
    orientation = "vertical" if _is_vertical_resolution(resolution) else "horizontal"

    return f"""
Create a premium airline marketing banner.

Banner type:
{banner_type}

Resolution:
{resolution}

Campaign:
{campaign_text}

Visual style:
{visual_style}

Layout constraint:
optimized for {orientation} {resolution} format.

IndiGo Airlines branding.
Blue and white colors.
Modern advertising design.
Ultra realistic final output.
""".strip()


def build_hashtags(platform: str, campaign: str, audience: str) -> list[str]:
    campaign_tokens = [token.strip("# ") for token in campaign.split() if token.isalpha()][:3]
    audience_token = "".join(char for char in audience.title() if char.isalnum())

    base = [
        "#GoIndiGo",
        "#FlySmart",
        "#TravelWith6E",
        f"#{platform.replace('/', '').replace(' ', '')}",
    ]

    for token in campaign_tokens:
        base.append(f"#{token.title()}")

    if audience_token:
        base.append(f"#{audience_token}")

    # Preserve order while removing duplicates.
    deduped = list(dict.fromkeys(base))
    return deduped[:8]


def best_posting_windows(platform: str) -> list[str]:
    windows = {
        "Instagram": ["11:30-13:00", "18:30-21:00"],
        "LinkedIn": ["08:00-10:00", "12:00-13:00"],
        "Facebook": ["09:00-11:00", "19:00-21:00"],
        "X": ["08:00-09:30", "17:00-19:00"],
        "Twitter/X": ["08:00-09:30", "17:00-19:00"],
        "YouTube": ["12:00-14:00", "19:00-22:00"],
    }
    return windows.get(platform, ["10:00-12:00", "18:00-20:00"])


def audience_adherence_score(platform: str, audience: str, tone: str) -> int:
    score = 70

    audience_l = audience.lower()
    tone_l = tone.lower()

    if platform == "Instagram" and ("gen" in audience_l or "youth" in audience_l):
        score += 15
    if platform == "LinkedIn" and ("professional" in audience_l or "business" in audience_l):
        score += 15
    if any(word in tone_l for word in ["premium", "luxury", "professional", "youthful", "bold"]):
        score += 10

    return max(0, min(100, score))


def build_social_insights(platform: str, campaign: str, audience: str, tone: str) -> dict[str, Any]:
    now_utc = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    return {
        "hashtags": build_hashtags(platform, campaign, audience),
        "best_posting_windows_local": best_posting_windows(platform),
        "audience_adherence_score": audience_adherence_score(platform, audience, tone),
        "generated_at_utc": now_utc,
    }


def _is_vertical_resolution(resolution: str) -> bool:
    cleaned = resolution.lower().replace(" ", "")
    if "x" not in cleaned:
        return False

    try:
        width_s, height_s = cleaned.split("x", maxsplit=1)
        width = int(width_s)
        height = int(height_s)
    except ValueError:
        return False

    return height > width
