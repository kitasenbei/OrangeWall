import uuid
from fastapi import APIRouter, HTTPException

from app.database import calendar_events_table
from app.schemas import EventCreate, EventUpdate, EventResponse

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/events", response_model=list[EventResponse])
def get_events():
    response = calendar_events_table.scan()
    items = response.get("Items", [])
    return sorted(items, key=lambda x: (x.get("date", ""), x.get("startTime", "")))


@router.get("/events/{event_id}", response_model=EventResponse)
def get_event(event_id: str):
    response = calendar_events_table.get_item(Key={"id": event_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    return item


@router.post("/events", response_model=EventResponse, status_code=201)
def create_event(event: EventCreate):
    item = {
        "id": str(uuid.uuid4()),
        "title": event.title,
        "date": event.date,
        "startTime": event.startTime,
        "endTime": event.endTime,
        "allDay": event.allDay,
        "color": event.color,
        "description": event.description,
    }
    calendar_events_table.put_item(Item=item)
    return item


@router.patch("/events/{event_id}", response_model=EventResponse)
def update_event(event_id: str, event: EventUpdate):
    response = calendar_events_table.get_item(Key={"id": event_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    for field in ["title", "date", "startTime", "endTime", "allDay", "color", "description"]:
        value = getattr(event, field)
        if value is not None:
            update_expr.append(f"#{field} = :{field}")
            expr_values[f":{field}"] = value
            expr_names[f"#{field}"] = field

    if update_expr:
        calendar_events_table.update_item(
            Key={"id": event_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = calendar_events_table.get_item(Key={"id": event_id})
    return response.get("Item")


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: str):
    response = calendar_events_table.get_item(Key={"id": event_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Event not found")
    calendar_events_table.delete_item(Key={"id": event_id})
    return None
