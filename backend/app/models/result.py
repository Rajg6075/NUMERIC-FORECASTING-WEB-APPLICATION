"""
Result model - represents a game result.
Contains result value, date, and status (live/waiting).
Linked to Game via foreign key.
"""
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, date
import enum
from app.db.database import Base


class ResultStatus(str, enum.Enum):
    """Enum for result status."""
    LIVE = "live"
    CLOSED = "closed"


class ResultType(str, enum.Enum):
    """Enum for result type."""
    OPEN = "open"
    CLOSE = "close"
    BOTH = "both"


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    result = Column(String, nullable=False)  # e.g., "123-45-678"
    result_type = Column(String, default=ResultType.BOTH.value)  # "open", "close", "both"
    open_result = Column(String, nullable=True)  # Open result value
    close_result = Column(String, nullable=True)  # Close result value
    result_date = Column(Date, default=date.today)
    status = Column(String, default=ResultStatus.LIVE.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship: Each result belongs to one game
    game = relationship("Game", back_populates="results")

    def __repr__(self):
        return f"<Result(id={self.id}, game_id={self.game_id}, result='{self.result}', status='{self.status}')>"
