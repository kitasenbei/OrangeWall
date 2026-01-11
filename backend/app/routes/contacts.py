import uuid
from fastapi import APIRouter, HTTPException

from app.database import contacts_table
from app.schemas import ContactCreate, ContactUpdate, ContactResponse

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactResponse])
def get_contacts():
    response = contacts_table.scan()
    items = response.get("Items", [])
    # Sort: favorites first, then alphabetically
    return sorted(items, key=lambda x: (not x.get("favorite", False), x.get("name", "").lower()))


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: str):
    response = contacts_table.get_item(Key={"id": contact_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Contact not found")
    return item


@router.post("", response_model=ContactResponse, status_code=201)
def create_contact(contact: ContactCreate):
    item = {
        "id": str(uuid.uuid4()),
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "company": contact.company,
        "notes": contact.notes,
        "avatar": contact.avatar,
        "favorite": contact.favorite,
    }
    contacts_table.put_item(Item=item)
    return item


@router.patch("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: str, contact: ContactUpdate):
    response = contacts_table.get_item(Key={"id": contact_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="Contact not found")

    update_expr = []
    expr_values = {}
    expr_names = {}

    for field in ["name", "email", "phone", "company", "notes", "avatar", "favorite"]:
        value = getattr(contact, field)
        if value is not None:
            update_expr.append(f"#{field} = :{field}")
            expr_values[f":{field}"] = value
            expr_names[f"#{field}"] = field

    if update_expr:
        contacts_table.update_item(
            Key={"id": contact_id},
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
        )

    response = contacts_table.get_item(Key={"id": contact_id})
    return response.get("Item")


@router.delete("/{contact_id}", status_code=204)
def delete_contact(contact_id: str):
    response = contacts_table.get_item(Key={"id": contact_id})
    if not response.get("Item"):
        raise HTTPException(status_code=404, detail="Contact not found")
    contacts_table.delete_item(Key={"id": contact_id})
    return None
