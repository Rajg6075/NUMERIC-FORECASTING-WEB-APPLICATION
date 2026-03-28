"""
Game model - represents a game/matka game.
Contains game name and time information.
"""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    open_time = Column(String, nullable=False)  # e.g., "10:00 AM"
    close_time = Column(String, nullable=False)  # e.g., "05:00 PM"
    working_days = Column(Integer, default=7)  # Number of working days per week (5, 6, or 7)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_result_reset = Column(DateTime, nullable=True)  # Tracks last daily reset at 6 AM

    # Relationship: One game has many results
    results = relationship("Result", back_populates="game", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Game(id={self.id}, name='{self.name}')>"
