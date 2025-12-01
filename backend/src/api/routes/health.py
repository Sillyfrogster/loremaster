"""Health and root endpoints."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
async def read_root() -> dict[str, str]:
    return {"message": "Loremaster API is alive"}


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
