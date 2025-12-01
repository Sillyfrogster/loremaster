"""Discord OAuth routes."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...services.discord import exchange_code, get_auth_url, get_user_info

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginUrlResponse(BaseModel):
    url: str


class AuthCallback(BaseModel):
    code: str


class AuthResponse(BaseModel):
    access_token: str
    user: dict[str, object]


@router.get("/login/discord", response_model=LoginUrlResponse)
async def login_discord():
    """Return the Discord OAuth authorize URL."""
    try:
        return {"url": get_auth_url()}
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/callback/discord", response_model=AuthResponse)
async def callback_discord(payload: AuthCallback):
    """Exchange the OAuth code for a Discord token and basic user info."""
    try:
        token_data = await exchange_code(payload.code)
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=502, detail="Discord did not return an access token"
            )

        user_info = await get_user_info(access_token)

        # In a real app, you might issue your own session JWT here.
        # For this base implementation, we'll return the Discord access token
        # as the session token (or a wrapped version).
        return {"access_token": access_token, "user": user_info}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail="Discord API error",
        )
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(status_code=500, detail="Unexpected auth failure") from exc
