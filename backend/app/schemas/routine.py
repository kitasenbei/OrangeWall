from pydantic import BaseModel


class RoutineBase(BaseModel):
    title: str
    description: str = ""
    icon: str = "Recycle"
    color: str = "bg-green-500"
    recurrenceType: str  # weekly, biweekly, monthly
    daysOfWeek: list[int] | None = None
    weeksOfMonth: list[int] | None = None
    daysOfMonth: list[int] | None = None
    category: str = "Other"


class RoutineCreate(RoutineBase):
    pass


class RoutineUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    recurrenceType: str | None = None
    daysOfWeek: list[int] | None = None
    weeksOfMonth: list[int] | None = None
    daysOfMonth: list[int] | None = None
    category: str | None = None


class RoutineResponse(RoutineBase):
    id: str
