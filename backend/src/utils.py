"""
Shared helpers for the backend.

These utilities stay in a single place to avoid import cycles between models
and the in-memory store.
"""

from __future__ import annotations

import time
import uuid
from typing import List


def now_ms() -> int:
    """Return the current timestamp in milliseconds."""
    return int(time.time() * 1000)


def generate_book_id() -> str:
    """Readable, mostly-unique book IDs to match the frontend format."""
    return f"book_{now_ms()}_{uuid.uuid4().hex[:6]}"


def generate_entry_uid() -> int:
    """Numeric UID for entries (matches the frontend UI's expectations)."""
    return now_ms()


def normalize_string_list(value: object) -> List[str]:
    """
    Accept lists, dicts, or scalar values and return a list of strings.

    This mirrors the frontend import handling where third-party lorebooks may
    encode keyword arrays as objects.
    """
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, dict):
        return [str(item) for item in value.values()]
    return [str(value)]
