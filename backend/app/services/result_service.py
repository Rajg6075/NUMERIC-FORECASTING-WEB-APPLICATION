"""
Result service - contains business logic for result operations.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.models.result import Result
from app.schemas.result import ResultCreate, ResultUpdate
from sqlalchemy import desc


class ResultService:
    """Service class for result-related operations."""

    @staticmethod
    def get_all_results(db: Session, game_id: Optional[int] = None) -> List[Result]:
        """Get all results, optionally filtered by game_id."""
        query = db.query(Result)
        if game_id:
            query = query.filter(Result.game_id == game_id)
        return query.order_by(desc(Result.created_at)).all()

    @staticmethod
    def get_result_by_id(db: Session, result_id: int) -> Optional[Result]:
        """Get a result by ID."""
        return db.query(Result).filter(Result.id == result_id).first()

    @staticmethod
    def get_results_by_game(db: Session, game_id: int) -> List[Result]:
        """Get all results for a specific game."""
        return (
            db.query(Result)
            .filter(Result.game_id == game_id)
            .order_by(desc(Result.result_date), desc(Result.created_at))
            .all()
        )

    @staticmethod
    def create_result(db: Session, result_data: ResultCreate) -> Result:
        """Create a new result."""
        # Set open_result or close_result based on result_type
        open_result = None
        close_result = None
        if result_data.result_type == 'open':
            open_result = result_data.result
        elif result_data.result_type == 'close':
            close_result = result_data.result
        else:
            # Both - use result as both
            open_result = result_data.result
            close_result = result_data.result
        
        db_result = Result(
            game_id=result_data.game_id,
            result=result_data.result,
            status=result_data.status,
            result_type=result_data.result_type,
            open_result=open_result,
            close_result=close_result,
            result_date=result_data.result_date or date.today()
        )
        db.add(db_result)
        db.commit()
        db.refresh(db_result)
        return db_result

    @staticmethod
    def update_result(db: Session, result_id: int, result_data: ResultUpdate) -> Optional[Result]:
        """Update an existing result."""
        db_result = db.query(Result).filter(Result.id == result_id).first()
        if not db_result:
            return None

        update_data = result_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_result, field, value)

        db.commit()
        db.refresh(db_result)
        return db_result

    @staticmethod
    def delete_result(db: Session, result_id: int) -> bool:
        """Delete a result."""
        db_result = db.query(Result).filter(Result.id == result_id).first()
        if not db_result:
            return False

        db.delete(db_result)
        db.commit()
        return True

    @staticmethod
    def get_latest_results_by_game(db: Session) -> dict:
        """Get latest result for each game."""
        from app.models.game import Game
        
        games = db.query(Game).all()
        latest_results = {}
        
        for game in games:
            latest = (
                db.query(Result)
                .filter(Result.game_id == game.id)
                .order_by(desc(Result.result_date), desc(Result.created_at))
                .first()
            )
            if latest:
                latest_results[game.id] = latest
        
        return latest_results
