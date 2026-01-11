import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.database import tasks_table
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def get_tasks():
    response = tasks_table.scan()
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("order", 0))


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str):
    response = tasks_table.get_item(Key={"id": task_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Task not found")
    return item


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate):
    response = tasks_table.scan(Select="COUNT")
    count = response.get("Count", 0)
    now = datetime.utcnow().isoformat()

    item = {
        "id": str(uuid.uuid4()),
        "title": task.title,
        "status": task.status,
        "description": task.description,
        "priority": task.priority,
        "dueDate": task.dueDate,
        "tags": task.tags,
        "subtasks": [s.model_dump() for s in task.subtasks],
        "order": count,
        "createdAt": now,
        "completedAt": None,
    }
    tasks_table.put_item(Item=item)
    return item


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task: TaskUpdate):
    response = tasks_table.get_item(Key={"id": task_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Task not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    fields = ["title", "description", "priority", "dueDate", "tags", "order"]
    for field in fields:
        value = getattr(task, field)
        if value is not None:
            update_expr.append(f"#{field} = :{field}")
            expr_values[f":{field}"] = value
            expr_names[f"#{field}"] = field

    # Handle status change with completedAt
    if task.status is not None:
        update_expr.append("#status = :status")
        expr_values[":status"] = task.status
        expr_names["#status"] = "status"

        if task.status == "completed" and item.get("status") != "completed":
            update_expr.append("#completedAt = :completedAt")
            expr_values[":completedAt"] = datetime.utcnow().isoformat()
            expr_names["#completedAt"] = "completedAt"
        elif task.status != "completed":
            update_expr.append("#completedAt = :completedAt")
            expr_values[":completedAt"] = None
            expr_names["#completedAt"] = "completedAt"

    # Handle subtasks
    if task.subtasks is not None:
        update_expr.append("#subtasks = :subtasks")
        expr_values[":subtasks"] = [s.model_dump() for s in task.subtasks]
        expr_names["#subtasks"] = "subtasks"

    if update_expr:
        tasks_table.update_item(
            Key={"id": task_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = tasks_table.get_item(Key={"id": task_id})
    return response.get("Item")


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str):
    response = tasks_table.get_item(Key={"id": task_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Task not found")

    tasks_table.delete_item(Key={"id": task_id})
    return None
