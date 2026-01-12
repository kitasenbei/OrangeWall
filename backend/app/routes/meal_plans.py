import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.database import meal_plans_table, recipes_table, grocery_lists_table
from app.schemas.meal_plan import (
    MealPlanCreate,
    MealPlanUpdate,
    MealPlanResponse,
)

router = APIRouter(prefix="/meal-plans", tags=["meal-plans"])


@router.get("", response_model=list[MealPlanResponse])
def get_meal_plans():
    response = meal_plans_table.scan()
    items = response.get("Items", [])
    return sorted(items, key=lambda x: x.get("startDate", ""), reverse=True)


@router.get("/{plan_id}", response_model=MealPlanResponse)
def get_meal_plan(plan_id: str):
    response = meal_plans_table.get_item(Key={"id": plan_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return item


@router.post("", response_model=MealPlanResponse, status_code=201)
def create_meal_plan(data: MealPlanCreate):
    item = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "startDate": data.startDate,
        "days": [d.model_dump() for d in data.days],
        "createdAt": datetime.utcnow().isoformat(),
    }
    meal_plans_table.put_item(Item=item)
    return item


@router.patch("/{plan_id}", response_model=MealPlanResponse)
def update_meal_plan(plan_id: str, data: MealPlanUpdate):
    response = meal_plans_table.get_item(Key={"id": plan_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    if data.name is not None:
        update_expr.append("#name = :name")
        expr_values[":name"] = data.name
        expr_names["#name"] = "name"

    if data.startDate is not None:
        update_expr.append("startDate = :startDate")
        expr_values[":startDate"] = data.startDate

    if data.days is not None:
        update_expr.append("days = :days")
        expr_values[":days"] = [d.model_dump() for d in data.days]

    if update_expr:
        meal_plans_table.update_item(
            Key={"id": plan_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names if expr_names else None,
        )

    response = meal_plans_table.get_item(Key={"id": plan_id})
    return response.get("Item")


@router.delete("/{plan_id}", status_code=204)
def delete_meal_plan(plan_id: str):
    response = meal_plans_table.get_item(Key={"id": plan_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Meal plan not found")
    meal_plans_table.delete_item(Key={"id": plan_id})
    return None


@router.post("/{plan_id}/generate-grocery")
def generate_grocery_from_meal_plan(plan_id: str, list_name: str = None):
    """
    Generate a grocery list from all recipes referenced in the meal plan.
    Aggregates ingredients from all linked recipes.
    """
    # Get the meal plan
    response = meal_plans_table.get_item(Key={"id": plan_id})
    plan = response.get("Item")
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")

    # Collect all recipe IDs from the meal plan
    recipe_ids = set()
    for day in plan.get("days", []):
        for meal_type in ["breakfast", "lunch", "snack", "dinner"]:
            meal = day.get(meal_type)
            if meal and meal.get("recipeId"):
                recipe_ids.add(meal["recipeId"])

    # Fetch all referenced recipes
    ingredients_map = {}  # name -> {category, quantity, unit}

    for recipe_id in recipe_ids:
        recipe_resp = recipes_table.get_item(Key={"id": recipe_id})
        recipe = recipe_resp.get("Item")
        if recipe:
            for ingredient in recipe.get("ingredients", []):
                # Parse ingredient string (e.g., "2 cups rice" or just "rice")
                name = ingredient.strip().lower()
                if name not in ingredients_map:
                    ingredients_map[name] = {
                        "id": str(uuid.uuid4()),
                        "name": ingredient.strip(),
                        "category": guess_category(name),
                        "checked": False,
                        "quantity": 1,
                        "unit": "",
                    }

    # Create grocery list
    grocery_list = {
        "id": str(uuid.uuid4()),
        "name": list_name or f"Groceries for {plan['name']}",
        "items": list(ingredients_map.values()),
        "createdAt": datetime.utcnow().isoformat(),
    }
    grocery_lists_table.put_item(Item=grocery_list)

    return {
        "message": f"Created grocery list with {len(ingredients_map)} items",
        "groceryListId": grocery_list["id"],
        "groceryListName": grocery_list["name"],
        "itemCount": len(ingredients_map),
    }


def guess_category(item_name: str) -> str:
    """Guess category based on item name."""
    name = item_name.lower()

    categories = {
        "Produce": ["apple", "banana", "orange", "fruit", "berr", "kiwi", "mikan"],
        "Vegetables": [
            "carrot", "broccoli", "lettuce", "onion", "potato", "tomato",
            "pepper", "celery", "spinach", "kabocha", "gobō", "gobo", "burdock",
            "okra", "daikon", "negi", "cabbage", "hakusai",
        ],
        "Dairy": ["milk", "cheese", "yogurt", "butter", "cream", "egg"],
        "Meat & Seafood": [
            "chicken", "beef", "pork", "fish", "salmon", "shrimp", "bacon",
            "sausage", "tonjiru", "さけ", "鮭",
        ],
        "Grains": [
            "rice", "玄米", "genmai", "oat", "bread", "パン", "soba", "noodle",
            "雑穀", "全粒粉",
        ],
        "Legumes": ["edamame", "tofu", "natto", "大豆", "豆", "hijiki", "seaweed", "mekabu", "wakame"],
        "Bakery": ["bread", "bagel", "muffin", "cake", "pastry", "croissant", "トースト"],
        "Beverages": ["juice", "soda", "water", "coffee", "tea", "wine", "beer"],
        "Pantry": ["miso", "soy sauce", "醤油", "ponzu", "dashi", "sesame", "ごま", "vinegar"],
        "Frozen": ["ice cream", "frozen", "pizza"],
        "Health": ["vitamin", "medicine", "supplement"],
    }

    for cat, keywords in categories.items():
        if any(kw in name for kw in keywords):
            return cat
    return "Other"
