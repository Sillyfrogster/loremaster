"""
Application factory for the Loremaster API.

Keeping app creation here allows tests and CLIs to import a configured FastAPI
instance without side effects.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .services.store import LorebookStore


def create_app() -> FastAPI:
    app = FastAPI(
        title="Loremaster API",
        version="1.0.0",
        summary="Backend for storing lorebooks previously kept in localStorage.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5330",
            "http://127.0.0.1:5330",
        ],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Attach store to the app so dependencies can grab it without re-importing.
    app.state.store = LorebookStore()

    # Routes are grouped under api_router for modularity.
    app.include_router(api_router)

    return app


# Expose a module-level app for `uvicorn backend.src.main:app` entrypoints.
app = create_app()
