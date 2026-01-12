from .tasks import router as tasks_router
from .statuses import router as statuses_router
from .notes import router as notes_router
from .kanban import router as kanban_router
from .calendar import router as calendar_router
from .routines import router as routines_router
from .schedule import router as schedule_router
from .contacts import router as contacts_router
from .preferences import router as preferences_router
from .recipes import router as recipes_router
from .grocery import router as grocery_router

__all__ = [
    "tasks_router",
    "statuses_router",
    "notes_router",
    "kanban_router",
    "calendar_router",
    "routines_router",
    "schedule_router",
    "contacts_router",
    "preferences_router",
    "recipes_router",
    "grocery_router",
]
