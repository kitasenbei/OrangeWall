import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.database import recipes_table
from app.schemas import RecipeCreate, RecipeUpdate, RecipeResponse

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeResponse])
def get_recipes():
    response = recipes_table.scan()
    items = response.get("Items", [])
    # Sort: favorites first, then by created date
    return sorted(items, key=lambda x: (not x.get("isFavorite", False), x.get("createdAt", "")), reverse=True)


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: str):
    response = recipes_table.get_item(Key={"id": recipe_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return item


@router.post("", response_model=RecipeResponse, status_code=201)
def create_recipe(recipe: RecipeCreate):
    item = {
        "id": str(uuid.uuid4()),
        "title": recipe.title,
        "description": recipe.description,
        "category": recipe.category,
        "prepTime": recipe.prepTime,
        "cookTime": recipe.cookTime,
        "servings": recipe.servings,
        "difficulty": recipe.difficulty,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "tags": recipe.tags,
        "isFavorite": recipe.isFavorite,
        "rating": recipe.rating,
        "createdAt": datetime.utcnow().isoformat(),
    }
    recipes_table.put_item(Item=item)
    return item


@router.patch("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(recipe_id: str, recipe: RecipeUpdate):
    response = recipes_table.get_item(Key={"id": recipe_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Recipe not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    fields = [
        "title", "description", "category", "prepTime", "cookTime",
        "servings", "difficulty", "ingredients", "instructions",
        "tags", "isFavorite", "rating"
    ]

    for field in fields:
        value = getattr(recipe, field)
        if value is not None:
            update_expr.append(f"#{field} = :{field}")
            expr_values[f":{field}"] = value
            expr_names[f"#{field}"] = field

    if update_expr:
        recipes_table.update_item(
            Key={"id": recipe_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = recipes_table.get_item(Key={"id": recipe_id})
    return response.get("Item")


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: str):
    response = recipes_table.get_item(Key={"id": recipe_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Recipe not found")
    recipes_table.delete_item(Key={"id": recipe_id})
    return None
