"""
Models package initialization.
Exports all models for easy importing.
"""
from app.models.game import Game
from app.models.result import Result
from app.models.admin import Admin

__all__ = ["Game", "Result", "Admin"]
