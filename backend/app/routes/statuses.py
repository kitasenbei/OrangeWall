from fastapi import APIRouter, HTTPException

from app.database import statuses_table
from app.schemas import StatusCreate, StatusUpdate, StatusResponse

router = APIRouter(prefix="/statuses", tags=["statuses"])


@router.get("", response_model=list[StatusResponse])
def get_statuses():
    response = statuses_table.scan()
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("order", 0))


@router.get("/{status_id}", response_model=StatusResponse)
def get_status(status_id: str):
    response = statuses_table.get_item(Key={"id": status_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Status not found")
    return item


@router.post("", response_model=StatusResponse, status_code=201)
def create_status(status: StatusCreate):
    existing = statuses_table.get_item(Key={"id": status.id})
    if existing.get("Item"):
        raise HTTPException(status_code=400, detail="Status already exists")

    response = statuses_table.scan(Select="COUNT")
    count = response.get("Count", 0)

    item = {
        "id": status.id,
        "label": status.label,
        "color": status.color,
        "icon": status.icon,
        "order": count,
    }
    statuses_table.put_item(Item=item)
    return item


@router.patch("/{status_id}", response_model=StatusResponse)
def update_status(status_id: str, status: StatusUpdate):
    response = statuses_table.get_item(Key={"id": status_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Status not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    if status.label is not None:
        update_expr.append("#label = :label")
        expr_values[":label"] = status.label
        expr_names["#label"] = "label"
    if status.color is not None:
        update_expr.append("#color = :color")
        expr_values[":color"] = status.color
        expr_names["#color"] = "color"
    if status.icon is not None:
        update_expr.append("#icon = :icon")
        expr_values[":icon"] = status.icon
        expr_names["#icon"] = "icon"
    if status.order is not None:
        update_expr.append("#order = :order")
        expr_values[":order"] = status.order
        expr_names["#order"] = "order"

    if update_expr:
        statuses_table.update_item(
            Key={"id": status_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = statuses_table.get_item(Key={"id": status_id})
    return response.get("Item")


@router.delete("/{status_id}", status_code=204)
def delete_status(status_id: str):
    response = statuses_table.get_item(Key={"id": status_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Status not found")

    statuses_table.delete_item(Key={"id": status_id})
    return None
