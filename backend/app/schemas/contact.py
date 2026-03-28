from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ContactBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city: Optional[str] = None
    state: Optional[str] = None
    message: str

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ContactUpdate(BaseModel):
    is_read: bool
