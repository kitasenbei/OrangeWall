from pydantic import BaseModel


class NoteBase(BaseModel):
    title: str
    content: str
    color: str = "default"
    pinned: bool = False
    starred: bool = False
    archived: bool = False
    tags: list[str] = []
    folderId: str | None = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    color: str | None = None
    pinned: bool | None = None
    starred: bool | None = None
    archived: bool | None = None
    tags: list[str] | None = None
    folderId: str | None = None


class NoteResponse(NoteBase):
    id: str
    createdAt: str
    updatedAt: str


# Note Folder schemas
class NoteFolderBase(BaseModel):
    name: str
    color: str = "default"


class NoteFolderCreate(NoteFolderBase):
    pass


class NoteFolderUpdate(BaseModel):
    name: str | None = None
    color: str | None = None


class NoteFolderResponse(NoteFolderBase):
    id: str
    createdAt: str
