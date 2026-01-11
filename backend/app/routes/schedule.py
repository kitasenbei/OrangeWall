import uuid
from fastapi import APIRouter, HTTPException

from app.database import schedule_blocks_table
from app.schemas import ScheduleBlockCreate, ScheduleBlockUpdate, ScheduleBlockResponse

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/blocks", response_model=list[ScheduleBlockResponse])
def get_blocks():
    response = schedule_blocks_table.scan()
    items = response.get("Items", [])
    # Sort by day order then start time
    day_order = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
                 "Friday": 4, "Saturday": 5, "Sunday": 6}
    return sorted(items, key=lambda x: (day_order.get(x.get("day", ""), 7), x.get("startTime", "")))


@router.get("/blocks/{block_id}", response_model=ScheduleBlockResponse)
def get_block(block_id: str):
    response = schedule_blocks_table.get_item(Key={"id": block_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Block not found")
    return item


@router.post("/blocks", response_model=ScheduleBlockResponse, status_code=201)
def create_block(block: ScheduleBlockCreate):
    item = {
        "id": str(uuid.uuid4()),
        "title": block.title,
        "day": block.day,
        "startTime": block.startTime,
        "endTime": block.endTime,
        "color": block.color,
    }
    schedule_blocks_table.put_item(Item=item)
    return item


@router.patch("/blocks/{block_id}", response_model=ScheduleBlockResponse)
def update_block(block_id: str, block: ScheduleBlockUpdate):
    response = schedule_blocks_table.get_item(Key={"id": block_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Block not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    for field in ["title", "day", "startTime", "endTime", "color"]:
        value = getattr(block, field)
        if value is not None:
            update_expr.append(f"#{field} = :{field}")
            expr_values[f":{field}"] = value
            expr_names[f"#{field}"] = field

    if update_expr:
        schedule_blocks_table.update_item(
            Key={"id": block_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = schedule_blocks_table.get_item(Key={"id": block_id})
    return response.get("Item")


@router.delete("/blocks/{block_id}", status_code=204)
def delete_block(block_id: str):
    response = schedule_blocks_table.get_item(Key={"id": block_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Block not found")
    schedule_blocks_table.delete_item(Key={"id": block_id})
    return None
