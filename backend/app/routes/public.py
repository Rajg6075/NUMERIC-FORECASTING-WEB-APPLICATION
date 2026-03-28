"""
Public routes - accessible without authentication.
Provides read-only access to games and results.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.schemas.game import GameResponse
from app.schemas.result import ResultResponse
from app.services.game_service import GameService
from app.services.result_service import ResultService

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/games", response_model=List[GameResponse])
def get_all_games(db: Session = Depends(get_db)):
    """
    Get all games with their latest result and status.
    Public endpoint - no authentication required.
    """
    games = GameService.get_all_games(db)
    
    # Enhance games with latest result info
    result = []
    for game in games:
        latest_open = GameService.get_latest_open_result(db, game.id)
        latest_close = GameService.get_latest_close_result(db, game.id)
        
        # Check if results should be reset (after 6 AM daily reset)
        # 6 AM IST = 0:30 AM UTC (since IST is UTC+5:30)
        now_utc = datetime.utcnow()
        today_6am_ist_utc = now_utc.replace(hour=0, minute=30, second=0, microsecond=0)
        
        # Determine if results should be hidden (created before today's 6 AM IST)
        should_reset_open = False
        should_reset_close = False
        
        if latest_open:
            # Result created before today's 6 AM IST should be hidden
            if latest_open.created_at.replace(tzinfo=None) < today_6am_ist_utc:
                should_reset_open = True
        
        if latest_close:
            # Result created before today's 6 AM IST should be hidden
            if latest_close.created_at.replace(tzinfo=None) < today_6am_ist_utc:
                should_reset_close = True
        
        # Determine result values based on reset status
        display_open_result = None if should_reset_open else (latest_open.open_result if latest_open else None)
        display_close_result = None if should_reset_close else (latest_close.close_result if latest_close else None)
        display_latest_result = display_open_result or display_close_result
        
        game_dict = {
            "id": game.id,
            "name": game.name,
            "open_time": game.open_time,
            "close_time": game.close_time,
            "working_days": game.working_days or 7,
            "created_at": game.created_at,
            "last_result_reset": game.last_result_reset,
            "latest_result": display_latest_result,
            "open_result": display_open_result,
            "close_result": display_close_result,
            "status": (latest_open.status if latest_open else latest_close.status) if latest_open or latest_close else "waiting"
        }
        result.append(game_dict)
    
    return result


@router.get("/games/{game_id}", response_model=GameResponse)
def get_game_by_id(game_id: int, db: Session = Depends(get_db)):
    """
    Get a specific game by ID with its latest result.
    Public endpoint - no authentication required.
    """
    game = GameService.get_game_by_id(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    latest_open = GameService.get_latest_open_result(db, game.id)
    latest_close = GameService.get_latest_close_result(db, game.id)
    
    return {
        "id": game.id,
        "name": game.name,
        "open_time": game.open_time,
        "close_time": game.close_time,
        "working_days": game.working_days or 7,
        "created_at": game.created_at,
        "latest_result": (latest_open.open_result or latest_close.close_result) if latest_open or latest_close else None,
        "open_result": latest_open.open_result if latest_open else None,
        "close_result": latest_close.close_result if latest_close else None,
        "status": (latest_open.status if latest_open else latest_close.status) if latest_open or latest_close else "waiting"
    }


@router.get("/results", response_model=List[ResultResponse])
def get_all_results(game_id: int = None, db: Session = Depends(get_db)):
    """
    Get all results, optionally filtered by game_id.
    Public endpoint - no authentication required.
    """
    results = ResultService.get_all_results(db, game_id)
    
    # Enhance results with game name
    result_list = []
    for r in results:
        result_dict = {
            "id": r.id,
            "game_id": r.game_id,
            "result": r.result,
            "result_type": r.result_type,
            "open_result": r.open_result,
            "close_result": r.close_result,
            "status": r.status,
            "result_date": r.result_date,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "game_name": r.game.name if r.game else None
        }
        result_list.append(result_dict)
    
    return result_list


@router.get("/results/{game_id}", response_model=List[ResultResponse])
def get_results_by_game(game_id: int, db: Session = Depends(get_db)):
    """
    Get all results for a specific game.
    Public endpoint - no authentication required.
    """
    results = ResultService.get_results_by_game(db, game_id)
    
    # Enhance results with game name
    result_list = []
    for r in results:
        result_dict = {
            "id": r.id,
            "game_id": r.game_id,
            "result": r.result,
            "result_type": r.result_type,
            "open_result": r.open_result,
            "close_result": r.close_result,
            "status": r.status,
            "result_date": r.result_date,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "game_name": r.game.name if r.game else None
        }
        result_list.append(result_dict)
    
    return result_list
