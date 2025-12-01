"""
In-memory storage layer for lorebooks.

This stays intentionally lightweight so it can be replaced by a database-backed
implementation later without rewriting the route layer.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Union

from fastapi import HTTPException
from pydantic import BaseModel

from ..models import (
    ActiveLorebookPayload,
    EntryMutationResponse,
    EntryPayload,
    LoreEntry,
    Lorebook,
    LorebookMeta,
)
from ..utils import (
    generate_book_id,
    generate_entry_uid,
    normalize_string_list,
    now_ms,
)

EntryLike = Union[LoreEntry, EntryPayload, Dict[str, object]]


class LorebookStore:
    """Minimal API that mirrors what the frontend needs."""

    def __init__(self) -> None:
        self._books: Dict[str, Lorebook] = {}
        self.active_id: Optional[str] = None
        self._seed_data()

    # -- public API --------------------------------------------------------- #
    def list_library(self) -> List[LorebookMeta]:
        return [self._to_meta(book) for book in self._books.values()]

    def get_lorebook(self, lorebook_id: str) -> Lorebook:
        book = self._books.get(lorebook_id)
        if not book:
            raise HTTPException(status_code=404, detail="Lorebook not found")
        return book

    def create_lorebook(self, name: str, entries: List[EntryLike]) -> Lorebook:
        book_id = generate_book_id()
        normalized_entries = [self._normalize_entry(entry) for entry in entries]
        now = now_ms()

        book = Lorebook(
            id=book_id,
            name=name or "New Lorebook",
            entryCount=len(normalized_entries),
            lastEdited=now,
            created=now,
            entries=normalized_entries,
        )
        self._books[book_id] = book

        if not self.active_id:
            self.active_id = book_id

        return book

    def delete_lorebook(self, lorebook_id: str) -> None:
        removed = self._books.pop(lorebook_id, None)
        if not removed:
            raise HTTPException(status_code=404, detail="Lorebook not found")

        if self.active_id == lorebook_id:
            self.active_id = next(iter(self._books.keys()), None)

    def update_lorebook_name(self, lorebook_id: str, name: str) -> LorebookMeta:
        book = self.get_lorebook(lorebook_id)
        book.name = name
        self._touch(book)
        return self._to_meta(book)

    def add_entry(self, lorebook_id: str, entry: EntryLike) -> EntryMutationResponse:
        book = self.get_lorebook(lorebook_id)
        normalized = self._normalize_entry(entry)
        book.entries.append(normalized)
        self._touch(book)
        return EntryMutationResponse(entry=normalized, lorebook=self._to_meta(book))

    def update_entry(
        self, lorebook_id: str, entry_uid: int, payload: EntryLike
    ) -> EntryMutationResponse:
        book = self.get_lorebook(lorebook_id)
        for idx, existing in enumerate(book.entries):
            if existing.uid == entry_uid:
                book.entries[idx] = self._normalize_entry(payload, entry_uid)
                self._touch(book)
                return EntryMutationResponse(
                    entry=book.entries[idx], lorebook=self._to_meta(book)
                )

        raise HTTPException(status_code=404, detail="Entry not found")

    def delete_entry(self, lorebook_id: str, entry_uid: int) -> EntryMutationResponse:
        book = self.get_lorebook(lorebook_id)
        before = len(book.entries)
        book.entries = [entry for entry in book.entries if entry.uid != entry_uid]

        if len(book.entries) == before:
            raise HTTPException(status_code=404, detail="Entry not found")

        self._touch(book)
        return EntryMutationResponse(entry=None, lorebook=self._to_meta(book))

    def set_active(self, lorebook_id: str) -> ActiveLorebookPayload:
        if lorebook_id not in self._books:
            raise HTTPException(status_code=404, detail="Lorebook not found")
        self.active_id = lorebook_id
        return ActiveLorebookPayload(activeId=lorebook_id)

    def clear_active(self) -> ActiveLorebookPayload:
        self.active_id = None
        return ActiveLorebookPayload(activeId=None)

    # -- helpers ------------------------------------------------------------ #
    def _normalize_entry(
        self, entry: EntryLike, force_uid: Optional[int] = None
    ) -> LoreEntry:
        """
        Accept either a BaseModel or raw dict and coerce fields into the shape
        the frontend expects (arrays instead of dicts, populated UID, etc.).
        """
        if isinstance(entry, BaseModel):
            data = entry.model_dump(exclude_none=True)
        elif isinstance(entry, dict):
            data = dict(entry)
        else:
            raise ValueError("Unsupported entry payload")

        data["key"] = normalize_string_list(data.get("key", []))
        data["keysecondary"] = normalize_string_list(data.get("keysecondary", []))
        data["uid"] = force_uid or data.get("uid") or generate_entry_uid()

        return LoreEntry(**data)

    def _touch(self, book: Lorebook) -> None:
        book.entryCount = len(book.entries)
        book.lastEdited = now_ms()

    def _to_meta(self, book: Lorebook) -> LorebookMeta:
        return LorebookMeta(
            id=book.id,
            name=book.name,
            entryCount=len(book.entries),
            lastEdited=book.lastEdited,
            created=book.created,
        )

    def _seed_data(self) -> None:
        """Starter lorebook so the UI has something to render on first run."""
        starter_entry = LoreEntry(
            comment="Getting Started",
            content="Replace me with your own lore. This entry demonstrates the schema.",
            key=["demo", "lore"],
            keysecondary=["sample"],
            constant=False,
        )
        book = self.create_lorebook("Starter Lorebook", [starter_entry])
        self.active_id = book.id
