import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.database import notes_table, note_folders_table
from app.schemas import (
    NoteCreate, NoteUpdate, NoteResponse,
    NoteFolderCreate, NoteFolderUpdate, NoteFolderResponse
)

router = APIRouter(prefix="/notes", tags=["notes"])


# Note Folder endpoints (must be before /{note_id} to avoid route conflicts)
@router.get("/folders", response_model=list[NoteFolderResponse])
def get_folders():
    response = note_folders_table.scan()
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("name", ""))


@router.post("/folders", response_model=NoteFolderResponse, status_code=201)
def create_folder(folder: NoteFolderCreate):
    now = datetime.utcnow().isoformat()
    item = {
        "id": str(uuid.uuid4()),
        "name": folder.name,
        "color": folder.color,
        "createdAt": now,
    }
    note_folders_table.put_item(Item=item)
    return item


@router.get("/folders/{folder_id}", response_model=NoteFolderResponse)
def get_folder(folder_id: str):
    response = note_folders_table.get_item(Key={"id": folder_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Folder not found")
    return item


@router.patch("/folders/{folder_id}", response_model=NoteFolderResponse)
def update_folder(folder_id: str, folder: NoteFolderUpdate):
    response = note_folders_table.get_item(Key={"id": folder_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Folder not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    if folder.name is not None:
        update_expr.append("#name = :name")
        expr_values[":name"] = folder.name
        expr_names["#name"] = "name"
    if folder.color is not None:
        update_expr.append("#color = :color")
        expr_values[":color"] = folder.color
        expr_names["#color"] = "color"

    if update_expr:
        note_folders_table.update_item(
            Key={"id": folder_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = note_folders_table.get_item(Key={"id": folder_id})
    return response.get("Item")


@router.delete("/folders/{folder_id}", status_code=204)
def delete_folder(folder_id: str):
    response = note_folders_table.get_item(Key={"id": folder_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Folder not found")
    note_folders_table.delete_item(Key={"id": folder_id})
    return None


# Note endpoints
@router.get("", response_model=list[NoteResponse])
def get_notes():
    response = notes_table.scan()
    items = response.get("Items", [])
    # Sort: pinned first, then by updatedAt
    return sorted(items, key=lambda x: (not x.get("pinned", False), x.get("updatedAt", "")), reverse=True)


@router.post("", response_model=NoteResponse, status_code=201)
def create_note(note: NoteCreate):
    now = datetime.utcnow().isoformat()
    item = {
        "id": str(uuid.uuid4()),
        "title": note.title,
        "content": note.content,
        "color": note.color,
        "pinned": note.pinned,
        "starred": note.starred,
        "archived": note.archived,
        "tags": note.tags,
        "folderId": note.folderId,
        "createdAt": now,
        "updatedAt": now,
    }
    notes_table.put_item(Item=item)
    return item


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: str):
    response = notes_table.get_item(Key={"id": note_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Note not found")
    return item


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, note: NoteUpdate):
    response = notes_table.get_item(Key={"id": note_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Note not found")

    update_expr = ["#updatedAt = :updatedAt"]
    expr_values = {":updatedAt": datetime.utcnow().isoformat()}
    expr_names = {"#updatedAt": "updatedAt"}

    if note.title is not None:
        update_expr.append("#title = :title")
        expr_values[":title"] = note.title
        expr_names["#title"] = "title"
    if note.content is not None:
        update_expr.append("#content = :content")
        expr_values[":content"] = note.content
        expr_names["#content"] = "content"
    if note.color is not None:
        update_expr.append("#color = :color")
        expr_values[":color"] = note.color
        expr_names["#color"] = "color"
    if note.pinned is not None:
        update_expr.append("#pinned = :pinned")
        expr_values[":pinned"] = note.pinned
        expr_names["#pinned"] = "pinned"
    if note.starred is not None:
        update_expr.append("#starred = :starred")
        expr_values[":starred"] = note.starred
        expr_names["#starred"] = "starred"
    if note.archived is not None:
        update_expr.append("#archived = :archived")
        expr_values[":archived"] = note.archived
        expr_names["#archived"] = "archived"
    if note.tags is not None:
        update_expr.append("#tags = :tags")
        expr_values[":tags"] = note.tags
        expr_names["#tags"] = "tags"
    if note.folderId is not None:
        update_expr.append("#folderId = :folderId")
        expr_values[":folderId"] = note.folderId
        expr_names["#folderId"] = "folderId"

    notes_table.update_item(
        Key={"id": note_id},
        UpdateExpression="SET " + ", ".join(update_expr),
        ExpressionAttributeValues=expr_values,
        ExpressionAttributeNames=expr_names,
    )

    response = notes_table.get_item(Key={"id": note_id})
    return response.get("Item")


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: str):
    response = notes_table.get_item(Key={"id": note_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Note not found")
    notes_table.delete_item(Key={"id": note_id})
    return None
