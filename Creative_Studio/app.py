from __future__ import annotations

from collections import Counter
from datetime import datetime
import os
from typing import Any

import requests
import streamlit as st
from dotenv import load_dotenv

try:
    from openai import AzureOpenAI
except ImportError:
    AzureOpenAI = None


st.set_page_config(
    page_title="6E Creative Studio",
    page_icon="6E",
    layout="wide",
)

load_dotenv()


def build_azure_configs() -> list[dict[str, str]]:
    configs: list[dict[str, str]] = []

    key_1 = os.getenv("AZURE_OPENAI_API_KEY")
    endpoint_1 = os.getenv("AZURE_OPENAI_ENDPOINT")
    model_1 = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-mini1")
    if key_1 and endpoint_1:
        configs.append({"model": model_1, "endpoint": endpoint_1, "key": key_1})

    key_2 = os.getenv("AZURE_OPENAI_API_KEY_2")
    endpoint_2 = os.getenv("AZURE_OPENAI_ENDPOINT_2")
    model_2 = os.getenv("AZURE_OPENAI_DEPLOYMENT_2", "gpt-5-mini6")
    if key_2 and endpoint_2:
        configs.append({"model": model_2, "endpoint": endpoint_2, "key": key_2})

    return configs


AZURE_CONFIGS = build_azure_configs()
CHAT_API_VERSION = os.getenv("AZURE_OPENAI_CHAT_API_VERSION", os.getenv("AZURE_OPENAI_API_VERSION", "2025-04-01-preview"))


def get_chat_response(messages: list[dict[str, str]]) -> tuple[str, str]:
    if AzureOpenAI is None:
        return "Azure OpenAI SDK not installed.", "none"

    if not AZURE_CONFIGS:
        return "Azure config missing in .env.", "none"

    for config in AZURE_CONFIGS:
        try:
            client = AzureOpenAI(
                api_key=config["key"],
                azure_endpoint=config["endpoint"],
                api_version=CHAT_API_VERSION,
            )

            response = client.responses.create(
                model=config["model"],
                input=messages,
                temperature=0.8,
                max_output_tokens=800,
            )

            if getattr(response, "output_text", None):
                return response.output_text, config["model"]

            text_parts: list[str] = []
            for item in (getattr(response, "output", None) or []):
                if getattr(item, "type", None) != "message":
                    continue
                for content in (getattr(item, "content", None) or []):
                    if getattr(content, "type", None) == "output_text":
                        text_parts.append(getattr(content, "text", ""))

            if text_parts:
                return "".join(text_parts), config["model"]
        except Exception as exc:
            print(f"Error with {config['model']}: {exc}")
            continue

    return "All Azure deployments failed.", "none"


def inject_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Manrope:wght@500;700&display=swap');

        :root {
            --bg-a: #f2f8ff;
            --bg-b: #dcebff;
            --accent: #005bbb;
            --accent-2: #1b8fff;
            --ink: #0d1b2a;
            --card: rgba(255, 255, 255, 0.9);
        }

        .stApp {
            background:
                radial-gradient(circle at 10% 10%, rgba(27, 143, 255, 0.22), transparent 35%),
                radial-gradient(circle at 90% 20%, rgba(0, 91, 187, 0.18), transparent 30%),
                linear-gradient(140deg, var(--bg-a), var(--bg-b));
            color: var(--ink);
            font-family: 'Space Grotesk', sans-serif;
        }

        h1, h2, h3 {
            font-family: 'Manrope', sans-serif;
            color: #07356a;
            letter-spacing: 0.3px;
        }

        .studio-card {
            border: 1px solid rgba(0, 91, 187, 0.2);
            border-radius: 16px;
            padding: 16px;
            background: var(--card);
            box-shadow: 0 8px 28px rgba(7, 53, 106, 0.12);
        }

        .kpi {
            padding: 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(27, 143, 255, 0.2);
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def init_session_state() -> None:
    defaults: dict[str, Any] = {
        "authenticated": False,
        "backend_url": "http://127.0.0.1:8000",
        "gallery": [],
        "social_result": None,
        "banner_result": None,
        "copy_variants": [],
        "copy_model_used": "rule-based",
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def api_post(base_url: str, path: str, payload: dict[str, Any]) -> dict[str, Any] | None:
    try:
        response = requests.post(f"{base_url}{path}", json=payload, timeout=60)
    except requests.RequestException as exc:
        st.error(f"Backend request failed: {exc}")
        return None

    if response.status_code != 200:
        st.error(f"Backend error {response.status_code}: {response.text}")
        return None

    return response.json()


def add_to_gallery(asset_type: str, title: str, data: dict[str, Any]) -> None:
    st.session_state.gallery.append(
        {
            "asset_type": asset_type,
            "title": title,
            "image_url": data.get("image_url", ""),
            "prompt": data.get("prompt", ""),
            "platform": data.get("platform", ""),
            "resolution": data.get("resolution", ""),
            "insights": data.get("insights", {}),
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
    )


def _fallback_copy_options(campaign: str, audience: str, tone: str, platform: str) -> list[str]:
    headline = f"{campaign} for {audience}"
    return [
        f"Copywriting 1: {headline}. Book your next trip with IndiGo today. Tone: {tone}. Platform: {platform}. CTA: Fly now.",
        f"Copywriting 2: Your {tone.lower()} escape starts here. {campaign} crafted for {audience}. CTA: Grab the deal.",
        f"Copywriting 3: IndiGo presents {campaign} with a {tone.lower()} feel for {platform}. CTA: Plan your route in one click.",
    ]


def generate_copy_options(campaign: str, audience: str, tone: str, platform: str) -> tuple[list[str], str]:
    prompt = (
        "Generate exactly 3 short ad copies for IndiGo Airlines. "
        f"Campaign: {campaign}. Audience: {audience}. Tone: {tone}. Platform: {platform}. "
        "Return each copy on a new line."
    )
    messages = [
        {"role": "system", "content": "You are a high-performing airline marketing copywriter."},
        {"role": "user", "content": prompt},
    ]

    reply, model_used = get_chat_response(messages)
    if model_used == "none":
        return _fallback_copy_options(campaign, audience, tone, platform), "rule-based"

    options = [line.strip("- ").strip() for line in reply.splitlines() if line.strip()]
    if len(options) < 3:
        return _fallback_copy_options(campaign, audience, tone, platform), "rule-based"

    return options[:3], model_used


def render_auth_screen() -> None:
    st.markdown("<div class='studio-card'>", unsafe_allow_html=True)
    st.title("6E Creative Studio")
    st.subheader("Hackathon Build Console")
    st.write("Sign-in screen is UI-only for demo. No authentication logic is enforced.")

    left, right = st.columns(2)
    with left:
        st.text_input("Email", placeholder="name@indigo.in", key="auth_email")
        st.text_input("Password", type="password", key="auth_password")
        if st.button("Enter Studio", width="stretch"):
            st.session_state.authenticated = True
            st.rerun()
    with right:
        st.markdown("### Why this demo stands out")
        st.write("- Platform-personalized social visuals")
        st.write("- Resolution-aware banner generation")
        st.write("- Smart posting analytics and hashtag suggestions")
    st.markdown("</div>", unsafe_allow_html=True)


def render_projects_tab(backend_url: str) -> None:
    social_tab, copy_tab, banner_tab = st.tabs(["Social", "Copywriting", "Banner"])

    with social_tab:
        left, right = st.columns([1, 2])
        with left:
            st.markdown("### Campaign Details")
            with st.form("social_form"):
                campaign_type = st.selectbox(
                    "Campaign Type",
                    ["Flash Sale", "Festival Offer", "Business Travel", "Weekend Escape"],
                )
                campaign_desc = st.text_area(
                    "Describe Campaign",
                    placeholder="Goa summer sale with youth-friendly fares",
                    height=100,
                )
                platform = st.selectbox("Platform", ["Instagram", "LinkedIn", "Facebook", "X", "YouTube"])
                audience = st.selectbox("Audience", ["Gen-Z", "Millennials", "Business", "Family", "Mixed"])
                tone = st.selectbox("Tone", ["Youthful", "Premium", "Corporate", "Warm", "Bold"])
                submitted = st.form_submit_button("Generate Social Asset", width="stretch")

            if submitted:
                if not campaign_desc.strip():
                    st.warning("Please add campaign details.")
                else:
                    campaign = f"{campaign_type}: {campaign_desc}"
                    payload = {
                        "platform": platform,
                        "campaign": campaign,
                        "audience": audience,
                        "tone": tone,
                    }
                    result = api_post(backend_url, "/generate-social-image", payload)
                    if result:
                        st.session_state.social_result = result
                        add_to_gallery("Social", campaign_type, result)

        with right:
            st.markdown("### Generated Social Creative")
            result = st.session_state.social_result
            if not result:
                st.info("Generate a social campaign to view image and insights.")
            else:
                st.write(f"Platform: {result.get('platform', '-')}")
                st.image(result.get("image_url", ""), width="stretch")
                insights = result.get("insights", {})
                st.markdown("#### Smart Insights")
                st.write("Hashtags: " + " ".join(insights.get("hashtags", [])))
                st.write("Best upload windows: " + ", ".join(insights.get("best_posting_windows_local", [])))
                adherence = insights.get("audience_adherence_score", 0)
                st.progress(adherence / 100)
                st.caption(f"Audience adherence score: {adherence}/100")

    with copy_tab:
        st.markdown("### Copywriting Lab")
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            copy_campaign = st.text_input("Campaign", value="Goa Summer Sale")
        with c2:
            copy_audience = st.selectbox("Audience", ["Gen-Z", "Business", "Family", "Mixed"], key="copy_aud")
        with c3:
            copy_tone = st.selectbox("Tone", ["Youthful", "Premium", "Warm", "Bold"], key="copy_tone")
        with c4:
            copy_platform = st.selectbox("Platform", ["Instagram", "LinkedIn", "Facebook", "X", "YouTube"], key="copy_platform")

        if st.button("Generate Copy Options", width="stretch"):
            variants, model_used = generate_copy_options(
                campaign=copy_campaign,
                audience=copy_audience,
                tone=copy_tone,
                platform=copy_platform,
            )
            st.session_state.copy_variants = variants
            st.session_state.copy_model_used = model_used

        if st.session_state.copy_variants:
            st.caption(f"Copy model: {st.session_state.copy_model_used}")
            for option in st.session_state.copy_variants:
                st.markdown(f"- {option}")

            timing_map = {
                "Instagram": "11:30-13:00, 18:30-21:00",
                "LinkedIn": "08:00-10:00, 12:00-13:00",
                "Facebook": "09:00-11:00, 19:00-21:00",
                "X": "08:00-09:30, 17:00-19:00",
                "YouTube": "12:00-14:00, 19:00-22:00",
            }
            st.info(f"Best posting windows for {copy_platform}: {timing_map.get(copy_platform, '10:00-12:00, 18:00-20:00')}")

    with banner_tab:
        left, right = st.columns([1, 2])
        with left:
            st.markdown("### Banner Studio")
            with st.form("banner_form"):
                banner_type = st.selectbox("Banner Type", ["Instagram Story", "LinkedIn Cover", "YouTube Thumbnail", "Homepage Hero"])
                resolution = st.selectbox("Resolution", ["1080x1080", "1080x1920", "1920x1080", "1280x720", "1200x628"])
                campaign_text = st.text_area("Campaign Text", placeholder="Fly to Goa this summer", height=100)
                visual_style = st.selectbox("Visual Style", ["Premium", "Cinematic", "Minimal", "Corporate", "High Contrast"])
                generate_banner = st.form_submit_button("Generate Banner", width="stretch")

            if generate_banner:
                if not campaign_text.strip():
                    st.warning("Please add campaign text for the banner.")
                else:
                    payload = {
                        "banner_type": banner_type,
                        "resolution": resolution,
                        "campaign_text": campaign_text,
                        "visual_style": visual_style,
                    }
                    result = api_post(backend_url, "/generate-banner", payload)
                    if result:
                        st.session_state.banner_result = result
                        add_to_gallery("Banner", banner_type, result)

        with right:
            st.markdown("### Generated Banner")
            result = st.session_state.banner_result
            if not result:
                st.info("Generate a banner to preview it here.")
            else:
                st.write(f"Resolution: {result.get('resolution', '-')}")
                st.image(result.get("image_url", ""), width="stretch")


def render_explore_tab() -> None:
    st.markdown("### Explore Gallery")
    if not st.session_state.gallery:
        st.info("No generated assets yet. Create social or banner assets in Projects.")
        return

    for item in reversed(st.session_state.gallery):
        st.markdown("<div class='studio-card'>", unsafe_allow_html=True)
        st.write(f"{item['asset_type']} | {item['title']} | {item['created_at']}")
        if item.get("image_url"):
            st.image(item["image_url"], width="stretch")
        if item.get("platform"):
            st.caption(f"Platform: {item['platform']}")
        if item.get("resolution"):
            st.caption(f"Resolution: {item['resolution']}")
        st.markdown("</div>", unsafe_allow_html=True)


def render_analytics_tab() -> None:
    st.markdown("### Analytics")

    gallery = st.session_state.gallery
    if not gallery:
        st.info("Analytics will appear after generating assets.")
        return

    total_assets = len(gallery)
    social_assets = sum(1 for item in gallery if item["asset_type"] == "Social")
    banner_assets = sum(1 for item in gallery if item["asset_type"] == "Banner")
    adherence_values = [
        item.get("insights", {}).get("audience_adherence_score")
        for item in gallery
        if item.get("insights", {}).get("audience_adherence_score") is not None
    ]
    avg_adherence = round(sum(adherence_values) / len(adherence_values), 1) if adherence_values else 0

    k1, k2, k3, k4 = st.columns(4)
    k1.metric("Assets Generated", total_assets)
    k2.metric("Social Assets", social_assets)
    k3.metric("Banner Assets", banner_assets)
    k4.metric("Avg Audience Adherence", f"{avg_adherence}%")

    all_windows: list[str] = []
    for item in gallery:
        all_windows.extend(item.get("insights", {}).get("best_posting_windows_local", []))

    if all_windows:
        st.markdown("#### Recommended Upload Slots")
        counts = Counter(all_windows)
        for slot, freq in counts.most_common(5):
            st.write(f"- {slot} ({freq} campaign signal)")

    st.markdown("#### Judge-friendly Summary")
    st.write("- Platform-personalized visual generation is active")
    st.write("- Resolution-aware banner generation is active")
    st.write("- Smart metadata: hashtags, posting windows, audience adherence")


def main() -> None:
    inject_styles()
    init_session_state()

    if not st.session_state.authenticated:
        render_auth_screen()
        return

    with st.sidebar:
        st.header("Studio Control")
        st.session_state.backend_url = st.text_input("Backend URL", value=st.session_state.backend_url)
        if st.button("Check Backend"):
            try:
                response = requests.get(st.session_state.backend_url, timeout=10)
                if response.status_code == 200:
                    st.success("Backend is live")
                else:
                    st.warning(f"Backend responded with {response.status_code}")
            except requests.RequestException as exc:
                st.error(f"Unable to reach backend: {exc}")

    st.title("6E Creative Studio")
    st.caption("Projects | Explore | Analytics")

    projects_tab, explore_tab, analytics_tab = st.tabs(["Projects", "Explore", "Analytics"])

    with projects_tab:
        render_projects_tab(st.session_state.backend_url)

    with explore_tab:
        render_explore_tab()

    with analytics_tab:
        render_analytics_tab()


if __name__ == "__main__":
    main()