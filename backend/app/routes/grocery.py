import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.database import grocery_lists_table
from app.schemas import ShoppingListCreate, ShoppingListUpdate, ShoppingListResponse

router = APIRouter(prefix="/grocery", tags=["grocery"])


@router.get("", response_model=list[ShoppingListResponse])
def get_lists():
    response = grocery_lists_table.scan()
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("createdAt", ""), reverse=True)


@router.get("/{list_id}", response_model=ShoppingListResponse)
def get_list(list_id: str):
    response = grocery_lists_table.get_item(Key={"id": list_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="List not found")
    return item


@router.post("", response_model=ShoppingListResponse, status_code=201)
def create_list(data: ShoppingListCreate):
    item = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "items": [i.model_dump() for i in data.items],
        "createdAt": datetime.utcnow().isoformat(),
    }
    grocery_lists_table.put_item(Item=item)
    return item


@router.patch("/{list_id}", response_model=ShoppingListResponse)
def update_list(list_id: str, data: ShoppingListUpdate):
    response = grocery_lists_table.get_item(Key={"id": list_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="List not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    if data.name is not None:
        update_expr.append("#name = :name")
        expr_values[":name"] = data.name
        expr_names["#name"] = "name"

    if data.items is not None:
        update_expr.append("#items = :items")
        expr_values[":items"] = [i.model_dump() for i in data.items]
        expr_names["#items"] = "items"

    if update_expr:
        grocery_lists_table.update_item(
            Key={"id": list_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = grocery_lists_table.get_item(Key={"id": list_id})
    return response.get("Item")


@router.delete("/{list_id}", status_code=204)
def delete_list(list_id: str):
    response = grocery_lists_table.get_item(Key={"id": list_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="List not found")
    grocery_lists_table.delete_item(Key={"id": list_id})
    return None
