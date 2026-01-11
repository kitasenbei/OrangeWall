from pydantic import BaseModel


class ContactBase(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    company: str = ""
    notes: str = ""
    avatar: str = ""
    favorite: bool = False


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    notes: str | None = None
    avatar: str | None = None
    favorite: bool | None = None


class ContactResponse(ContactBase):
    id: str
