"""
Game schemas using Pydantic.
Used for request/response validation and serialization.
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class GameBase(BaseModel):
    """Base schema for Game (shared fields)."""
    name: str
    open_time: str
    close_time: str
    working_days: int = 7  # Number of working days per week (5, 6, or 7)


class GameCreate(GameBase):
    """Schema for creating a new game."""
    pass


class GameUpdate(BaseModel):
    """Schema for updating an existing game."""
    name: Optional[str] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    working_days: Optional[int] = None


class GameResponse(GameBase):
    """Schema for game response (includes ID and timestamps)."""
    id: int
    created_at: datetime
    last_result_reset: Optional[datetime] = None
    latest_result: Optional[str] = None
    open_result: Optional[str] = None
    close_result: Optional[str] = None
    status: Optional[str] = None
    working_days: int = 7

    class Config:
        from_attributes = True


class GameWithResults(GameResponse):
    """Schema for game with its results."""
    results: List["ResultResponse"] = []
