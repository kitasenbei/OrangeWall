from pydantic import BaseModel


class EventBase(BaseModel):
    title: str
    date: str  # ISO date string
    startTime: str | None = None
    endTime: str | None = None
    allDay: bool = False
    color: str = "default"
    description: str = ""


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = None
    date: str | None = None
    startTime: str | None = None
    endTime: str | None = None
    allDay: bool | None = None
    color: str | None = None
    description: str | None = None


class EventResponse(EventBase):
    id: str
