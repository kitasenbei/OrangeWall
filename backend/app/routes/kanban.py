import uuid
from fastapi import APIRouter, HTTPException

from app.database import kanban_boards_table, kanban_columns_table, kanban_cards_table
from app.schemas import (
    BoardCreate, BoardUpdate, BoardResponse,
    ColumnCreate, ColumnUpdate, ColumnResponse,
    CardCreate, CardUpdate, CardResponse,
)

router = APIRouter(prefix="/kanban", tags=["kanban"])


# Boards
@router.get("/boards", response_model=list[BoardResponse])
def get_boards():
    response = kanban_boards_table.scan()
    return response.get("Items", [])


@router.post("/boards", response_model=BoardResponse, status_code=201)
def create_board(board: BoardCreate):
    item = {
        "id": str(uuid.uuid4()),
        "title": board.title,
    }
    kanban_boards_table.put_item(Item=item)
    return item


@router.patch("/boards/{board_id}", response_model=BoardResponse)
def update_board(board_id: str, board: BoardUpdate):
    response = kanban_boards_table.get_item(Key={"id": board_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Board not found")

    if board.title is not None:
        kanban_boards_table.update_item(
            Key={"id": board_id},
            UpdateExpression="SET #title = :title",
            ExpressionAttributeValues={":title": board.title},
            ExpressionAttributeNames={"#title": "title"},
        )

    response = kanban_boards_table.get_item(Key={"id": board_id})
    return response.get("Item")


@router.delete("/boards/{board_id}", status_code=204)
def delete_board(board_id: str):
    response = kanban_boards_table.get_item(Key={"id": board_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Board not found")

    # Delete all columns and cards for this board
    columns = kanban_columns_table.query(
        IndexName="board-index",
        KeyConditionExpression="boardId = :bid",
        ExpressionAttributeValues={":bid": board_id}
    ).get("Items", [])

    for col in columns:
        # Delete cards in column
        cards = kanban_cards_table.query(
            IndexName="column-index",
            KeyConditionExpression="columnId = :cid",
            ExpressionAttributeValues={":cid": col["id"]}
        ).get("Items", [])
        for card in cards:
            kanban_cards_table.delete_item(Key={"id": card["id"]})
        kanban_columns_table.delete_item(Key={"id": col["id"]})

    kanban_boards_table.delete_item(Key={"id": board_id})
    return None


# Columns
@router.get("/boards/{board_id}/columns", response_model=list[ColumnResponse])
def get_columns(board_id: str):
    response = kanban_columns_table.query(
        IndexName="board-index",
        KeyConditionExpression="boardId = :bid",
        ExpressionAttributeValues={":bid": board_id}
    )
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("order", 0))


@router.post("/columns", response_model=ColumnResponse, status_code=201)
def create_column(column: ColumnCreate):
    # Get count for order
    response = kanban_columns_table.query(
        IndexName="board-index",
        KeyConditionExpression="boardId = :bid",
        ExpressionAttributeValues={":bid": column.boardId},
        Select="COUNT"
    )
    count = response.get("Count", 0)

    item = {
        "id": str(uuid.uuid4()),
        "title": column.title,
        "boardId": column.boardId,
        "order": count,
    }
    kanban_columns_table.put_item(Item=item)
    return item


@router.patch("/columns/{column_id}", response_model=ColumnResponse)
def update_column(column_id: str, column: ColumnUpdate):
    response = kanban_columns_table.get_item(Key={"id": column_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Column not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    if column.title is not None:
        update_expr.append("#title = :title")
        expr_values[":title"] = column.title
        expr_names["#title"] = "title"
    if column.order is not None:
        update_expr.append("#order = :order")
        expr_values[":order"] = column.order
        expr_names["#order"] = "order"

    if update_expr:
        kanban_columns_table.update_item(
            Key={"id": column_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = kanban_columns_table.get_item(Key={"id": column_id})
    return response.get("Item")


@router.delete("/columns/{column_id}", status_code=204)
def delete_column(column_id: str):
    response = kanban_columns_table.get_item(Key={"id": column_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Column not found")

    # Delete all cards in column
    cards = kanban_cards_table.query(
        IndexName="column-index",
        KeyConditionExpression="columnId = :cid",
        ExpressionAttributeValues={":cid": column_id}
    ).get("Items", [])
    for card in cards:
        kanban_cards_table.delete_item(Key={"id": card["id"]})

    kanban_columns_table.delete_item(Key={"id": column_id})
    return None


# Cards
@router.get("/columns/{column_id}/cards", response_model=list[CardResponse])
def get_cards(column_id: str):
    response = kanban_cards_table.query(
        IndexName="column-index",
        KeyConditionExpression="columnId = :cid",
        ExpressionAttributeValues={":cid": column_id}
    )
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("order", 0))


@router.post("/cards", response_model=CardResponse, status_code=201)
def create_card(card: CardCreate):
    # Get count for order
    response = kanban_cards_table.query(
        IndexName="column-index",
        KeyConditionExpression="columnId = :cid",
        ExpressionAttributeValues={":cid": card.columnId},
        Select="COUNT"
    )
    count = response.get("Count", 0)

    item = {
        "id": str(uuid.uuid4()),
        "title": card.title,
        "description": card.description,
        "columnId": card.columnId,
        "order": count,
    }
    kanban_cards_table.put_item(Item=item)
    return item


@router.patch("/cards/{card_id}", response_model=CardResponse)
def update_card(card_id: str, card: CardUpdate):
    response = kanban_cards_table.get_item(Key={"id": card_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Card not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    if card.title is not None:
        update_expr.append("#title = :title")
        expr_values[":title"] = card.title
        expr_names["#title"] = "title"
    if card.description is not None:
        update_expr.append("#description = :description")
        expr_values[":description"] = card.description
        expr_names["#description"] = "description"
    if card.columnId is not None:
        update_expr.append("#columnId = :columnId")
        expr_values[":columnId"] = card.columnId
        expr_names["#columnId"] = "columnId"
    if card.order is not None:
        update_expr.append("#order = :order")
        expr_values[":order"] = card.order
        expr_names["#order"] = "order"

    if update_expr:
        kanban_cards_table.update_item(
            Key={"id": card_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = kanban_cards_table.get_item(Key={"id": card_id})
    return response.get("Item")


@router.delete("/cards/{card_id}", status_code=204)
def delete_card(card_id: str):
    response = kanban_cards_table.get_item(Key={"id": card_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Card not found")
    kanban_cards_table.delete_item(Key={"id": card_id})
    return None
