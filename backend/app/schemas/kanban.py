from pydantic import BaseModel


# Board
class BoardBase(BaseModel):
    title: str


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BaseModel):
    title: str | None = None


class BoardResponse(BoardBase):
    id: str


# Column
class ColumnBase(BaseModel):
    title: str
    boardId: str


class ColumnCreate(ColumnBase):
    pass


class ColumnUpdate(BaseModel):
    title: str | None = None
    order: int | None = None


class ColumnResponse(ColumnBase):
    id: str
    order: int


# Card
class CardBase(BaseModel):
    title: str
    description: str = ""
    columnId: str


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    columnId: str | None = None
    order: int | None = None


class CardResponse(CardBase):
    id: str
    order: int
