"""
Routes package initialization.
"""
from app.routes.public import router as public_router
from app.routes.admin_api import router as admin_router

__all__ = ["public_router", "admin_router"]
