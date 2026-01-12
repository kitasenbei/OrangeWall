from pydantic import BaseModel


class MealEntry(BaseModel):
    name: str
    recipeId: str | None = None  # Optional link to a recipe
    notes: str | None = None


class MealPlanDay(BaseModel):
    date: str  # ISO date "2026-01-12"
    breakfast: MealEntry | None = None
    lunch: MealEntry | None = None
    snack: MealEntry | None = None
    dinner: MealEntry | None = None


class MealPlanBase(BaseModel):
    name: str
    startDate: str  # ISO date for the week start
    days: list[MealPlanDay] = []


class MealPlanCreate(MealPlanBase):
    pass


class MealPlanUpdate(BaseModel):
    name: str | None = None
    startDate: str | None = None
    days: list[MealPlanDay] | None = None


class MealPlanResponse(MealPlanBase):
    id: str
    createdAt: str
