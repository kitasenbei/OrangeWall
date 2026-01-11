from pydantic import BaseModel


class Subtask(BaseModel):
    id: str
    title: str
    completed: bool = False


class TaskBase(BaseModel):
    title: str
    status: str = "pending"
    description: str = ""
    priority: str = "medium"
    dueDate: str | None = None
    tags: list[str] = []
    subtasks: list[Subtask] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    description: str | None = None
    priority: str | None = None
    dueDate: str | None = None
    tags: list[str] | None = None
    subtasks: list[Subtask] | None = None
    order: int | None = None


class TaskResponse(TaskBase):
    id: str
    order: int
    createdAt: str
    completedAt: str | None = None
