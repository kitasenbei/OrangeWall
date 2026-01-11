from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.routes import (
    tasks_router,
    statuses_router,
    notes_router,
    kanban_router,
    calendar_router,
    routines_router,
    schedule_router,
    contacts_router,
    preferences_router,
)

app = FastAPI(
    title="Orangewall API",
    description="Backend API for Orangewall personal hub",
    version="0.1.0",
)

# CORS - allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register all routers
app.include_router(tasks_router, prefix="/api")
app.include_router(statuses_router, prefix="/api")
app.include_router(notes_router, prefix="/api")
app.include_router(kanban_router, prefix="/api")
app.include_router(calendar_router, prefix="/api")
app.include_router(routines_router, prefix="/api")
app.include_router(schedule_router, prefix="/api")
app.include_router(contacts_router, prefix="/api")
app.include_router(preferences_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Lambda handler
handler = Mangum(app)
