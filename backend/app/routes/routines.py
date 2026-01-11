import uuid
from fastapi import APIRouter, HTTPException

from app.database import routines_table
from app.schemas import RoutineCreate, RoutineUpdate, RoutineResponse

router = APIRouter(prefix="/routines", tags=["routines"])


@router.get("", response_model=list[RoutineResponse])
def get_routines():
    response = routines_table.scan()
    return response.get("Items", [])


@router.get("/{routine_id}", response_model=RoutineResponse)
def get_routine(routine_id: str):
    response = routines_table.get_item(Key={"id": routine_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Routine not found")
    return item


@router.post("", response_model=RoutineResponse, status_code=201)
def create_routine(routine: RoutineCreate):
    item = {
        "id": str(uuid.uuid4()),
        "title": routine.title,
        "description": routine.description,
        "icon": routine.icon,
        "color": routine.color,
        "recurrenceType": routine.recurrenceType,
        "category": routine.category,
    }

    if routine.daysOfWeek is not None:
        item["daysOfWeek"] = routine.daysOfWeek
    if routine.weeksOfMonth is not None:
        item["weeksOfMonth"] = routine.weeksOfMonth
    if routine.daysOfMonth is not None:
        item["daysOfMonth"] = routine.daysOfMonth

    routines_table.put_item(Item=item)
    return item


@router.patch("/{routine_id}", response_model=RoutineResponse)
def update_routine(routine_id: str, routine: RoutineUpdate):
    response = routines_table.get_item(Key={"id": routine_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Routine not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    fields = ["title", "description", "icon", "color", "recurrenceType", "category",
              "daysOfWeek", "weeksOfMonth", "daysOfMonth"]

    for field in fields:
        value = getattr(routine, field)
        if value is not None:
            update_expr.append(f"#{field} = :{field}")
            expr_values[f":{field}"] = value
            expr_names[f"#{field}"] = field

    if update_expr:
        routines_table.update_item(
            Key={"id": routine_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = routines_table.get_item(Key={"id": routine_id})
    return response.get("Item")


@router.delete("/{routine_id}", status_code=204)
def delete_routine(routine_id: str):
    response = routines_table.get_item(Key={"id": routine_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Routine not found")
    routines_table.delete_item(Key={"id": routine_id})
    return None
