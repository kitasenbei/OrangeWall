from fastapi import APIRouter, Request

from app.database import user_preferences_table
from app.schemas import UserPreferencesUpdate, UserPreferencesResponse

router = APIRouter(prefix="/preferences", tags=["preferences"])


def get_user_id(request: Request) -> str:
    # In production, extract from JWT claims
    # For now, use a default user
    return request.headers.get("X-User-Id", "default-user")


@router.get("", response_model=UserPreferencesResponse)
def get_preferences(request: Request):
    user_id = get_user_id(request)
    response = user_preferences_table.get_item(Key={"userId": user_id})
    item = response.get("Item")

    if not item:
        # Return defaults
        return {
            "userId": user_id,
            "favoriteTools": [],
            "theme": "system",
            "sidebarCollapsed": False,
        }
    return item


@router.patch("", response_model=UserPreferencesResponse)
def update_preferences(request: Request, prefs: UserPreferencesUpdate):
    user_id = get_user_id(request)

    # Get existing or create new
    response = user_preferences_table.get_item(Key={"userId": user_id})
    item = response.get("Item")

    if not item:
        item = {
            "userId": user_id,
            "favoriteTools": [],
            "theme": "system",
            "sidebarCollapsed": False,
        }

    update_expr = []
    expr_values = {}
    expr_names = {}

    if prefs.favoriteTools is not None:
        update_expr.append("#favoriteTools = :favoriteTools")
        expr_values[":favoriteTools"] = prefs.favoriteTools
        expr_names["#favoriteTools"] = "favoriteTools"
    if prefs.theme is not None:
        update_expr.append("#theme = :theme")
        expr_values[":theme"] = prefs.theme
        expr_names["#theme"] = "theme"
    if prefs.sidebarCollapsed is not None:
        update_expr.append("#sidebarCollapsed = :sidebarCollapsed")
        expr_values[":sidebarCollapsed"] = prefs.sidebarCollapsed
        expr_names["#sidebarCollapsed"] = "sidebarCollapsed"

    if update_expr:
        user_preferences_table.update_item(
            Key={"userId": user_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )
    else:
        # Create if doesn't exist
        user_preferences_table.put_item(Item=item)

    response = user_preferences_table.get_item(Key={"userId": user_id})
    return response.get("Item") or item
