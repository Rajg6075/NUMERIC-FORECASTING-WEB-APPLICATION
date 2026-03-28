"""
Result schemas using Pydantic.
Used for request/response validation and serialization.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ResultBase(BaseModel):
    """Base schema for Result (shared fields)."""
    result: str
    status: str = "waiting"  # "live" or "waiting"
    result_type: str = "both"  # "open", "close", "both"


class ResultCreate(ResultBase):
    """Schema for creating a new result."""
    game_id: int
    result_date: Optional[date] = None
    open_result: Optional[str] = None
    close_result: Optional[str] = None


class ResultUpdate(BaseModel):
    """Schema for updating an existing result."""
    result: Optional[str] = None
    status: Optional[str] = None
    result_date: Optional[date] = None
    result_type: Optional[str] = None
    open_result: Optional[str] = None
    close_result: Optional[str] = None


class ResultResponse(ResultBase):
    """Schema for result response (includes ID and timestamps)."""
    id: int
    game_id: int
    result_date: date
    created_at: datetime
    updated_at: Optional[datetime] = None
    game_name: Optional[str] = None
    open_result: Optional[str] = None
    close_result: Optional[str] = None

    class Config:
        from_attributes = True
