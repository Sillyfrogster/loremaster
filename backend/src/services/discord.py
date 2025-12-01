"""
Discord OAuth helper functions used by the auth routes.

Keeping Discord-specific logic in one place makes the routes easy to read and
lets us swap providers later without touching the API layer.
"""

from __future__ import annotations

import os
from typing import Any, Dict

import httpx
from dotenv import load_dotenv

load_dotenv()

DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI", "http://localhost:5173/auth/callback")

DISCORD_API_BASE = "https://discord.com/api/v10"
HTTP_TIMEOUT = httpx.Timeout(10.0)


def _require_credentials() -> None:
    if not DISCORD_CLIENT_ID or not DISCORD_CLIENT_SECRET:
        raise ValueError("Discord OAuth credentials are not configured")


def get_auth_url() -> str:
    if not DISCORD_CLIENT_ID:
        raise ValueError("DISCORD_CLIENT_ID is not set")

    # Scopes: identify (username, avatar), email (optional)
    return (
        f"https://discord.com/api/oauth2/authorize?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}&response_type=code&scope=identify"
    )


async def exchange_code(code: str) -> Dict[str, Any]:
    _require_credentials()

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        payload = {
            "client_id": DISCORD_CLIENT_ID,
            "client_secret": DISCORD_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        response = await client.post(
            f"{DISCORD_API_BASE}/oauth2/token",
            data=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()

    if not data.get("access_token"):
        raise ValueError("Discord did not return an access token")

    return data


async def get_user_info(access_token: str) -> Dict[str, Any]:
    if not access_token:
        raise ValueError("Missing Discord access token")

    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await client.get(f"{DISCORD_API_BASE}/users/@me", headers=headers)
        response.raise_for_status()
        return response.json()
