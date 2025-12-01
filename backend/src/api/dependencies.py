"""FastAPI dependencies shared by route modules."""

from fastapi import Request

from ..services.store import LorebookStore


def get_store(request: Request) -> LorebookStore:
    """
    Pull the LorebookStore off the app state so routes can remain thin.

    Keeping this in a dedicated dependency avoids importing the app instance
    inside route modules (which keeps testability high).
    """
    return request.app.state.store
