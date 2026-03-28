from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse, ContactUpdate

router = APIRouter()

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact submission"""
    db_contact = Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    skip: int = 0, 
    limit: int = 100, 
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all contact submissions (admin only)"""
    query = db.query(Contact)
    
    if unread_only:
        query = query.filter(Contact.is_read == False)
    
    contacts = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return contacts

@router.get("/contacts/{contact_id}", response_model=ContactResponse)
async def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a specific contact submission"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: int, 
    contact_update: ContactUpdate, 
    db: Session = Depends(get_db)
):
    """Mark contact as read/unread"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact.is_read = contact_update.is_read
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact submission"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}

@router.get("/contacts/unread/count")
async def get_unread_count(db: Session = Depends(get_db)):
    """Get count of unread contact submissions"""
    count = db.query(Contact).filter(Contact.is_read == False).count()
    return {"unread_count": count}
