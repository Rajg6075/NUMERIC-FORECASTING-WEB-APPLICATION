"""
Schemas package initialization.
Exports all Pydantic schemas for easy importing.
"""
from app.schemas.game import GameCreate, GameUpdate, GameResponse
from app.schemas.result import ResultCreate, ResultUpdate, ResultResponse
from app.schemas.admin import AdminLogin, AdminResponse, Token, TokenData

__all__ = [
    "GameCreate",
    "GameUpdate", 
    "GameResponse",
    "ResultCreate",
    "ResultUpdate",
    "ResultResponse",
    "AdminLogin",
    "AdminResponse",
    "Token",
    "TokenData"
]
