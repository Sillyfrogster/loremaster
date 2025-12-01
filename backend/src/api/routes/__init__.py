from fastapi import APIRouter

from . import auth, health, lorebooks

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(lorebooks.router)

__all__ = ["api_router"]
