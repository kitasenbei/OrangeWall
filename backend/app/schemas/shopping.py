from pydantic import BaseModel


class ShoppingItem(BaseModel):
    id: str
    name: str
    category: str = "Other"
    checked: bool = False
    quantity: int = 1
    unit: str = ""
    note: str | None = None
    price: float | None = None


class ShoppingListBase(BaseModel):
    name: str
    items: list[ShoppingItem] = []


class ShoppingListCreate(ShoppingListBase):
    pass


class ShoppingListUpdate(BaseModel):
    name: str | None = None
    items: list[ShoppingItem] | None = None


class ShoppingListResponse(ShoppingListBase):
    id: str
    createdAt: str
