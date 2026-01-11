from pydantic import BaseModel


class RecipeBase(BaseModel):
    title: str
    description: str = ""
    category: str = "dinner"
    prepTime: int = 0
    cookTime: int = 0
    servings: int = 4
    difficulty: str = "medium"
    ingredients: list[str] = []
    instructions: list[str] = []
    tags: list[str] = []
    isFavorite: bool = False
    rating: int | None = None


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    prepTime: int | None = None
    cookTime: int | None = None
    servings: int | None = None
    difficulty: str | None = None
    ingredients: list[str] | None = None
    instructions: list[str] | None = None
    tags: list[str] | None = None
    isFavorite: bool | None = None
    rating: int | None = None


class RecipeResponse(RecipeBase):
    id: str
    createdAt: str
