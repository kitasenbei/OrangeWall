from pydantic import BaseModel


class ContactLink(BaseModel):
    type: str  # email, phone, discord, twitter, linkedin, instagram, github, telegram, whatsapp, line, slack, website
    value: str
    label: str = ""  # optional label like "Work", "Personal"


class ContactBase(BaseModel):
    name: str
    company: str = ""
    role: str = ""
    category: str = "other"  # investor, client, partner, mentor, other
    notes: str = ""
    links: list[ContactLink] = []
    lastContact: str | None = None
    nextFollowUp: str | None = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: str | None = None
    company: str | None = None
    role: str | None = None
    category: str | None = None
    notes: str | None = None
    links: list[ContactLink] | None = None
    lastContact: str | None = None
    nextFollowUp: str | None = None


class ContactResponse(ContactBase):
    id: str
