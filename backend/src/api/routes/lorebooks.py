"""Lorebook CRUD endpoints."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends

from ..dependencies import get_store
from ...models import (
    ActiveLorebookPayload,
    CreateLorebookPayload,
    EntryMutationResponse,
    EntryPayload,
    Lorebook,
    LorebookMeta,
    UpdateLorebookPayload,
)
from ...services.store import LorebookStore

router = APIRouter(tags=["lorebooks"])


@router.get("/lorebooks", response_model=List[LorebookMeta])
async def list_lorebooks(
    store: LorebookStore = Depends(get_store),
) -> List[LorebookMeta]:
    """Return lightweight metadata for the library sidebar."""
    return store.list_library()


@router.get("/lorebooks/{lorebook_id}", response_model=Lorebook)
async def get_lorebook(
    lorebook_id: str, store: LorebookStore = Depends(get_store)
) -> Lorebook:
    """Fetch a full lorebook (metadata + entries)."""
    return store.get_lorebook(lorebook_id)


@router.post("/lorebooks", response_model=Lorebook, status_code=201)
async def create_lorebook(
    payload: CreateLorebookPayload, store: LorebookStore = Depends(get_store)
) -> Lorebook:
    """Create a lorebook and persist its initial entries."""
    return store.create_lorebook(payload.name, payload.entries)


@router.patch("/lorebooks/{lorebook_id}", response_model=LorebookMeta)
async def rename_lorebook(
    lorebook_id: str,
    payload: UpdateLorebookPayload,
    store: LorebookStore = Depends(get_store),
) -> LorebookMeta:
    return store.update_lorebook_name(lorebook_id, payload.name)


# Return 200 with a tiny payload to avoid 204/body constraints in FastAPI.
@router.delete("/lorebooks/{lorebook_id}", status_code=200)
async def delete_lorebook(
    lorebook_id: str, store: LorebookStore = Depends(get_store)
) -> dict[str, str]:
    store.delete_lorebook(lorebook_id)
    return {"status": "deleted"}


@router.post(
    "/lorebooks/{lorebook_id}/entries",
    response_model=EntryMutationResponse,
    status_code=201,
)
async def add_entry(
    lorebook_id: str, payload: EntryPayload, store: LorebookStore = Depends(get_store)
) -> EntryMutationResponse:
    """Add a new entry. The backend will mint the UID if the client omitted it."""
    return store.add_entry(lorebook_id, payload)


@router.put(
    "/lorebooks/{lorebook_id}/entries/{entry_uid}",
    response_model=EntryMutationResponse,
)
async def update_entry(
    lorebook_id: str,
    entry_uid: int,
    payload: EntryPayload,
    store: LorebookStore = Depends(get_store),
) -> EntryMutationResponse:
    """Replace an entry payload by UID."""
    return store.update_entry(lorebook_id, entry_uid, payload)


@router.delete(
    "/lorebooks/{lorebook_id}/entries/{entry_uid}",
    response_model=EntryMutationResponse,
)
async def delete_entry(
    lorebook_id: str,
    entry_uid: int,
    store: LorebookStore = Depends(get_store),
) -> EntryMutationResponse:
    """
    Delete an entry and return the updated metadata so the client can keep its
    counts and timestamps in sync.
    """
    return store.delete_entry(lorebook_id, entry_uid)


@router.get("/active-lorebook", response_model=ActiveLorebookPayload)
async def get_active_lorebook(
    store: LorebookStore = Depends(get_store),
) -> ActiveLorebookPayload:
    """Fetch the last active lorebook ID (used to restore sessions)."""
    return ActiveLorebookPayload(activeId=store.active_id)


@router.put("/active-lorebook/{lorebook_id}", response_model=ActiveLorebookPayload)
async def set_active_lorebook(
    lorebook_id: str,
    store: LorebookStore = Depends(get_store),
) -> ActiveLorebookPayload:
    """Persist the active lorebook selection server-side."""
    return store.set_active(lorebook_id)


@router.delete("/active-lorebook", response_model=ActiveLorebookPayload)
async def clear_active_lorebook(
    store: LorebookStore = Depends(get_store),
) -> ActiveLorebookPayload:
    """Explicitly clear the active pointer (used when the last lorebook is removed)."""
    return store.clear_active()
