"""
Admin model - for authentication.
Only one admin exists in the system.
"""
from sqlalchemy import Column, Integer, String
from app.db.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # Hashed password

    def __repr__(self):
        return f"<Admin(id={self.id}, username='{self.username}')>"
