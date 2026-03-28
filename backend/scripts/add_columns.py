"""
Run this script to add missing columns to the results table.
Usage: python -m scripts.add_columns
"""
from sqlalchemy import text
from app.db.database import engine

def add_columns():
    with engine.connect() as conn:
        # Add result_type column
        try:
            conn.execute(text("ALTER TABLE results ADD COLUMN IF NOT EXISTS result_type VARCHAR(20) DEFAULT 'both'"))
            print("✓ Added result_type column")
        except Exception as e:
            print(f"result_type: {e}")
        
        # Add open_result column
        try:
            conn.execute(text("ALTER TABLE results ADD COLUMN IF NOT EXISTS open_result VARCHAR(50)"))
            print("✓ Added open_result column")
        except Exception as e:
            print(f"open_result: {e}")
        
        # Add close_result column
        try:
            conn.execute(text("ALTER TABLE results ADD COLUMN IF NOT EXISTS close_result VARCHAR(50)"))
            print("✓ Added close_result column")
        except Exception as e:
            print(f"close_result: {e}")
        
        conn.commit()
        print("\nDone! Restart the backend.")

if __name__ == "__main__":
    add_columns()
