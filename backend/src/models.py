"""
Pydantic models shared across routes and the in-memory store.

These mirror the fields used in the Vue editor so round-tripping data between
frontend and backend is lossless.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from .utils import generate_entry_uid


class LoreEntry(BaseModel):
    """
    Represents a single lore entry.

    Extra keys are permitted so imports from third-party lorebooks remain
    flexible.
    """

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    uid: int = Field(default_factory=generate_entry_uid)
    comment: str = ""
    content: str = ""
    key: List[str] = Field(default_factory=list)
    keysecondary: List[str] = Field(default_factory=list)
    enabled: bool = True
    disabled: bool = False
    constant: bool = False
    selective: bool = True
    addMemo: bool = True
    caseSensitive: bool = False
    matchWholeWords: bool = True
    position: int = 0
    order: int = 100
    sticky: int = 0
    cooldown: int = 0
    delay: int = 0
    useProbability: bool = False
    probability: int = 100
    selectiveLogic: int = 0
    excludeRecursion: bool = False
    preventRecursion: bool = False
    delayUntilRecursion: bool = False
    depth: int = 4
    group: str = ""
    groupOverride: bool = False
    groupWeight: int = 100
    role: str = ""
    automationId: str = ""
    ignoreBudget: bool = False
    matchPersonaDescription: bool = False
    matchCharacterDescription: bool = False
    matchCharacterPersonality: bool = False
    matchCharacterDepthPrompt: bool = False
    matchScenario: bool = False
    matchCreatorNotes: bool = False
    useGroupScoring: bool = False
    outletName: str = ""
    characterFilter: Dict = Field(default_factory=dict)
    scanDepth: int | str | None = None


class Lorebook(BaseModel):
    """Full lorebook payload (metadata + entries)."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    entryCount: int = Field(default=0)
    lastEdited: int
    created: int
    entries: List[LoreEntry] = Field(default_factory=list)


class LorebookMeta(BaseModel):
    """Library view of a lorebook without the heavy entries payload."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    entryCount: int
    lastEdited: int
    created: int


class EntryMutationResponse(BaseModel):
    """Response shape for entry CRUD so the frontend can refresh metadata."""

    entry: Optional[LoreEntry] = None
    lorebook: LorebookMeta


class ActiveLorebookPayload(BaseModel):
    """Track which lorebook the user last opened."""

    activeId: Optional[str] = None


class CreateLorebookPayload(BaseModel):
    """Payload for creating a lorebook from scratch or via import."""

    name: str = "New Lorebook"
    entries: List[LoreEntry] = Field(default_factory=list)


class UpdateLorebookPayload(BaseModel):
    """Patch-only name for now; extend if more metadata is added later."""

    name: str


class EntryPayload(BaseModel):
    """Mirror LoreEntry but keep it lightweight for mutations."""

    model_config = ConfigDict(extra="allow")

    uid: Optional[int] = None
    comment: str = ""
    content: str = ""
    key: List[str] | Dict | None = None
    keysecondary: List[str] | Dict | None = None
    enabled: Optional[bool] = True
    disabled: Optional[bool] = False
    constant: Optional[bool] = False
    selective: Optional[bool] = True
    addMemo: Optional[bool] = True
    caseSensitive: Optional[bool] = False
    matchWholeWords: Optional[bool] = True
    position: Optional[int] = 0
    order: Optional[int] = 100
    sticky: Optional[int] = 0
    cooldown: Optional[int] = 0
    delay: Optional[int] = 0
    useProbability: Optional[bool] = False
    probability: Optional[int] = 100
    selectiveLogic: Optional[int] = 0
    excludeRecursion: Optional[bool] = False
    preventRecursion: Optional[bool] = False
    delayUntilRecursion: Optional[bool] = False
    depth: Optional[int] = 4
    group: Optional[str] = ""
    groupOverride: Optional[bool] = False
    groupWeight: Optional[int] = 100
    role: Optional[str] = ""
    automationId: Optional[str] = ""
    ignoreBudget: Optional[bool] = False
    matchPersonaDescription: Optional[bool] = False
    matchCharacterDescription: Optional[bool] = False
    matchCharacterPersonality: Optional[bool] = False
    matchCharacterDepthPrompt: Optional[bool] = False
    matchScenario: Optional[bool] = False
    matchCreatorNotes: Optional[bool] = False
    useGroupScoring: Optional[bool] = False
    outletName: Optional[str] = ""
    characterFilter: Optional[Dict] = None
    scanDepth: int | str | None = None
