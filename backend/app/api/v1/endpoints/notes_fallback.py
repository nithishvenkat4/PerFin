"""Fallback document endpoints for Notes and Conversations.
Ensures the app functions seamlessly in single-container unified deployment.
"""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
os.makedirs(DATA_DIR, exist_ok=True)
NOTES_FILE = os.path.join(DATA_DIR, "notes.json")
CONVERSATIONS_FILE = os.path.join(DATA_DIR, "conversations.json")


def _read_json(filepath: str) -> List[Dict[str, Any]]:
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _write_json(filepath: str, data: List[Dict[str, Any]]):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


router = APIRouter(prefix="/api", tags=["Document Store"])


@router.get("/health")
def document_health():
    return {
        "status": "ONLINE",
        "service": "perfin-document-service",
        "engine": "Embedded Document Store",
        "database": "Document Store (Embedded)",
        "mongoConnected": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


class NotePayload(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []
    pinned: Optional[bool] = False
    color: Optional[str] = "#FFFFFF"


@router.get("/notes")
def list_notes(search: Optional[str] = None, tag: Optional[str] = None):
    notes = _read_json(NOTES_FILE)
    if search:
        q = search.lower()
        notes = [n for n in notes if q in n.get("title", "").lower() or q in n.get("content", "").lower()]
    if tag:
        t = tag.lower()
        notes = [n for n in notes if any(t == str(x).lower() for x in n.get("tags", []))]
    return {"success": True, "data": notes, "count": len(notes)}


@router.post("/notes", status_code=201)
def create_note(payload: NotePayload):
    notes = _read_json(NOTES_FILE)
    now = datetime.now(timezone.utc).isoformat()
    note_id = str(uuid.uuid4())
    new_note = {
        "_id": note_id,
        "id": note_id,
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "tags": payload.tags or [],
        "pinned": bool(payload.pinned),
        "color": payload.color or "#FFFFFF",
        "createdAt": now,
        "updatedAt": now,
    }
    notes.insert(0, new_note)
    _write_json(NOTES_FILE, notes)
    return {"success": True, "data": new_note, "message": "Note created successfully"}


@router.put("/notes/{note_id}")
def update_note(note_id: str, payload: Dict[str, Any]):
    notes = _read_json(NOTES_FILE)
    for n in notes:
        if n.get("_id") == note_id or n.get("id") == note_id:
            for k, v in payload.items():
                if k not in ["_id", "id", "createdAt"]:
                    n[k] = v
            n["updatedAt"] = datetime.now(timezone.utc).isoformat()
            _write_json(NOTES_FILE, notes)
            return {"success": True, "data": n}
    return {"success": False, "message": "Note not found"}


@router.delete("/notes/{note_id}")
def delete_note(note_id: str):
    notes = _read_json(NOTES_FILE)
    notes = [n for n in notes if n.get("_id") != note_id and n.get("id") != note_id]
    _write_json(NOTES_FILE, notes)
    return {"success": True, "message": "Note deleted successfully"}


class ConversationPayload(BaseModel):
    title: str
    messages: Optional[List[Dict[str, Any]]] = []


@router.get("/conversations")
def list_conversations():
    convs = _read_json(CONVERSATIONS_FILE)
    return {"success": True, "data": convs, "count": len(convs)}


@router.post("/conversations", status_code=201)
def create_conversation(payload: ConversationPayload):
    convs = _read_json(CONVERSATIONS_FILE)
    now = datetime.now(timezone.utc).isoformat()
    conv_id = str(uuid.uuid4())
    new_conv = {
        "_id": conv_id,
        "id": conv_id,
        "title": payload.title.strip(),
        "messages": payload.messages or [],
        "createdAt": now,
        "updatedAt": now,
    }
    convs.insert(0, new_conv)
    _write_json(CONVERSATIONS_FILE, convs)
    return {"success": True, "data": new_conv}


@router.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: str):
    convs = _read_json(CONVERSATIONS_FILE)
    convs = [c for c in convs if c.get("_id") != conv_id and c.get("id") != conv_id]
    _write_json(CONVERSATIONS_FILE, convs)
    return {"success": True, "message": "Conversation deleted"}
