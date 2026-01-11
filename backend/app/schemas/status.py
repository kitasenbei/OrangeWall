from pydantic import BaseModel


class StatusBase(BaseModel):
    label: str
    color: str = "text-muted-foreground"
    icon: str | None = None


class StatusCreate(StatusBase):
    id: str


class StatusUpdate(BaseModel):
    label: str | None = None
    color: str | None = None
    icon: str | None = None
    order: int | None = None


class StatusResponse(StatusBase):
    id: str
    order: int
