"""
Result Reset Scheduler Service - handles automated daily result reset at 6:00 AM.
Resets game results display to '---' while preserving data in database.
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging

from app.db.database import SessionLocal
from app.models.game import Game

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def reset_game_results_job():
    """
    Scheduled job that runs daily at 6:00 AM.
    Sets last_result_reset timestamp on all games to trigger UI reset.
    """
    db = SessionLocal()
    try:
        logger.info(f"Running result reset job at {datetime.utcnow()}")
        
        now = datetime.utcnow()
        
        # Update all games to mark that results should be reset
        games = db.query(Game).all()
        reset_count = 0
        
        for game in games:
            game.last_result_reset = now
            reset_count += 1
        
        db.commit()
        
        logger.info(f"Result reset completed: {reset_count} games marked for reset")
        
    except Exception as e:
        logger.error(f"Error during result reset job: {str(e)}")
    finally:
        db.close()


def init_result_reset_scheduler():
    """Initialize the scheduler for daily result reset at 6:00 AM."""
    if scheduler.running:
        scheduler.remove_all_jobs()

    scheduler.add_job(
        reset_game_results_job,
        trigger=CronTrigger(hour=6, minute=0),
        id="daily_result_reset",
        name="Daily Result Reset at 6:00 AM",
        replace_existing=True
    )

    if not scheduler.running:
        scheduler.start()
        logger.info("Result reset scheduler started. Results will reset daily at 6:00 AM.")

    return scheduler


def shutdown_result_reset_scheduler():
    """Shutdown the scheduler gracefully."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Result reset scheduler shutdown complete.")
