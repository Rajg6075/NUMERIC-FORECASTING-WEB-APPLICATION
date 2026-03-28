"""
Main application file.
Initializes FastAPI app, database, and routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.models import Game, Result, Admin, Contact
from app.services.auth_service import AuthService
from app.services.result_reset_service import init_result_reset_scheduler, shutdown_result_reset_scheduler
from app.routes import public_router, admin_router
from app.routes.contact import router as contact_router

# Create FastAPI app
app = FastAPI(
    title="Game Results API",
    description="API for managing games and results",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for ngrok testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)


# Create initial admin if not exists
@app.on_event("startup")
def startup_event():
    """Initialize application on startup."""
    # Create default admin
    db = SessionLocal()
    try:
        admin = db.query(Admin).first()
        if not admin:
            AuthService.create_admin(db, "admin", "admin123")
            print("Initial admin created: username='admin', password='admin123'")
            print("IMPORTANT: Change this password in production!")
    finally:
        db.close()
    
    # Initialize result reset scheduler for 6:00 AM daily
    init_result_reset_scheduler()
    print("Result reset scheduler initialized: Results will reset daily at 6:00 AM")


@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown."""
    shutdown_result_reset_scheduler()
    print("Result reset scheduler shutdown complete")


# Include routers
app.include_router(public_router)
app.include_router(admin_router)
app.include_router(contact_router, prefix="/api", tags=["contacts"])


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Game Results API",
        "docs": "/docs",
        "endpoints": {
            "public": {
                "games": "/api/games",
                "results": "/api/results",
                "game_results": "/api/results/{game_id}"
            },
            "admin": {
                "login": "/api/admin/login",
                "create_game": "POST /api/admin/games",
                "create_result": "POST /api/admin/results",
                "update_result": "PUT /api/admin/results/{id}"
            }
        },
        "features": {
            "auto_reset_results": "Results reset daily at 6:00 AM (UI only, data preserved)"
        }
    }