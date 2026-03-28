"""
Admin routes - require authentication.
Provides CRUD operations for games and results.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.game import GameCreate, GameUpdate, GameResponse
from app.schemas.result import ResultCreate, ResultUpdate, ResultResponse
from app.schemas.admin import AdminLogin, AdminResponse, Token, TokenData
from app.services.game_service import GameService
from app.services.result_service import ResultService
from app.services.auth_service import AuthService
from app.models.admin import Admin

router = APIRouter(prefix="/api/admin", tags=["admin"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Dependency to get the current authenticated admin.
    Validates the JWT token and returns the admin user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = AuthService.decode_token(token)
    if username is None:
        raise credentials_exception
    
    admin = AuthService.get_admin_by_username(db, username)
    if admin is None:
        raise credentials_exception
    
    return admin


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Admin login endpoint.
    Returns JWT token upon successful authentication.
    """
    login_data = AdminLogin(username=form_data.username, password=form_data.password)
    admin = AuthService.authenticate_admin(db, login_data)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = AuthService.create_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=AdminResponse)
def get_current_admin_info(current_admin: Admin = Depends(get_current_admin)):
    """
    Get current admin info.
    Requires authentication.
    """
    return current_admin


# Game management endpoints
@router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
def create_game(
    game_data: GameCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Create a new game.
    Requires admin authentication.
    """
    game = GameService.create_game(db, game_data)
    return {
        "id": game.id,
        "name": game.name,
        "open_time": game.open_time,
        "close_time": game.close_time,
        "created_at": game.created_at,
        "latest_result": None,
        "status": "waiting"
    }


@router.put("/games/{game_id}", response_model=GameResponse)
def update_game(
    game_id: int,
    game_data: GameUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Update an existing game.
    Requires admin authentication.
    """
    game = GameService.update_game(db, game_id, game_data)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    latest_result = GameService.get_latest_result_for_game(db, game.id)
    return {
        "id": game.id,
        "name": game.name,
        "open_time": game.open_time,
        "close_time": game.close_time,
        "created_at": game.created_at,
        "latest_result": latest_result.result if latest_result else None,
        "status": latest_result.status if latest_result else "waiting"
    }


@router.delete("/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Delete a game and all its results.
    Requires admin authentication.
    """
    success = GameService.delete_game(db, game_id)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found")
    return None


# Result management endpoints
@router.post("/results", response_model=ResultResponse, status_code=status.HTTP_201_CREATED)
def create_result(
    result_data: ResultCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Create a new result for a game.
    Requires admin authentication.
    """
    # Verify game exists
    game = GameService.get_game_by_id(db, result_data.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    result = ResultService.create_result(db, result_data)
    return {
        "id": result.id,
        "game_id": result.game_id,
        "result": result.result,
        "result_type": result.result_type,
        "open_result": result.open_result,
        "close_result": result.close_result,
        "status": result.status,
        "result_date": result.result_date,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
        "game_name": game.name
    }


@router.put("/results/{result_id}", response_model=ResultResponse)
def update_result(
    result_id: int,
    result_data: ResultUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Update an existing result.
    Requires admin authentication.
    """
    result = ResultService.update_result(db, result_id, result_data)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    return {
        "id": result.id,
        "game_id": result.game_id,
        "result": result.result,
        "status": result.status,
        "result_date": result.result_date,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
        "game_name": result.game.name if result.game else None
    }


@router.delete("/results/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Delete a result.
    Requires admin authentication.
    """
    success = ResultService.delete_result(db, result_id)
    if not success:
        raise HTTPException(status_code=404, detail="Result not found")
    return None
