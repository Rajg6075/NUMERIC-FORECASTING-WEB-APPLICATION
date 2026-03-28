"""
Game service - contains business logic for game operations.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.game import Game
from app.models.result import Result
from app.schemas.game import GameCreate, GameUpdate
from sqlalchemy import desc


class GameService:
    """Service class for game-related operations."""

    @staticmethod
    def get_all_games(db: Session) -> List[Game]:
        """Get all games with their latest result."""
        return db.query(Game).order_by(Game.created_at.desc()).all()

    @staticmethod
    def get_game_by_id(db: Session, game_id: int) -> Optional[Game]:
        """Get a game by ID."""
        return db.query(Game).filter(Game.id == game_id).first()

    @staticmethod
    def create_game(db: Session, game_data: GameCreate) -> Game:
        """Create a new game."""
        db_game = Game(
            name=game_data.name,
            open_time=game_data.open_time,
            close_time=game_data.close_time
        )
        db.add(db_game)
        db.commit()
        db.refresh(db_game)
        return db_game

    @staticmethod
    def update_game(db: Session, game_id: int, game_data: GameUpdate) -> Optional[Game]:
        """Update an existing game."""
        db_game = db.query(Game).filter(Game.id == game_id).first()
        if not db_game:
            return None

        update_data = game_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_game, field, value)

        db.commit()
        db.refresh(db_game)
        return db_game

    @staticmethod
    def delete_game(db: Session, game_id: int) -> bool:
        """Delete a game and its results."""
        db_game = db.query(Game).filter(Game.id == game_id).first()
        if not db_game:
            return False

        db.delete(db_game)
        db.commit()
        return True

    @staticmethod
    def get_latest_result_for_game(db: Session, game_id: int) -> Optional[Result]:
        """Get the latest result for a specific game."""
        return (
            db.query(Result)
            .filter(Result.game_id == game_id)
            .order_by(desc(Result.created_at))
            .first()
        )

    @staticmethod
    def get_latest_open_result(db: Session, game_id: int) -> Optional[Result]:
        """Get the latest Open result for a specific game."""
        return (
            db.query(Result)
            .filter(Result.game_id == game_id)
            .filter(Result.result_type.in_(['open', 'both']))
            .order_by(desc(Result.result_date), desc(Result.created_at))
            .first()
        )

    @staticmethod
    def get_latest_close_result(db: Session, game_id: int) -> Optional[Result]:
        """Get the latest Close result for a specific game."""
        return (
            db.query(Result)
            .filter(Result.game_id == game_id)
            .filter(Result.result_type.in_(['close', 'both']))
            .order_by(desc(Result.result_date), desc(Result.created_at))
            .first()
        )
