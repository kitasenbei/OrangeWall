from pydantic import BaseModel


class ScheduleBlockBase(BaseModel):
    title: str
    day: str  # Monday, Tuesday, etc.
    startTime: str  # HH:MM
    endTime: str  # HH:MM
    color: str = "bg-blue-500"


class ScheduleBlockCreate(ScheduleBlockBase):
    pass


class ScheduleBlockUpdate(BaseModel):
    title: str | None = None
    day: str | None = None
    startTime: str | None = None
    endTime: str | None = None
    color: str | None = None


class ScheduleBlockResponse(ScheduleBlockBase):
    id: str
