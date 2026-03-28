"""
Demo data generator script.
Generates sample results for the last 3 months using pana from PanaDashboard logic.
"""
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import DATABASE_URL, get_db
from app.models.result import Result
from app.models.game import Game
from app.services.game_service import GameService
from app.services.result_service import ResultService
from app.schemas.game import GameCreate
from app.schemas.result import ResultCreate


def generate_all_pana():
    """Generate all pana numbers like PanaDashboard"""
    pana_list = []
    digit_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    for i in range(len(digit_order)):
        for j in range(i, len(digit_order)):
            for k in range(j, len(digit_order)):
                pana_list.append(f"{digit_order[i]}{digit_order[j]}{digit_order[k]}")
    return pana_list


def get_digit_sum(num: str) -> int:
    """Get digit sum mod 10"""
    return sum(int(d) for d in num) % 10


def get_pana_for_digit(digit: int):
    """Get pana list for a specific digit (like PanaDashboard)"""
    all_pana = generate_all_pana()
    filtered = [p for p in all_pana if get_digit_sum(p) == digit]
    
    # Add triples
    triples = ['111', '222', '333', '444', '555', '666', '777', '888', '999', '000']
    for triple in triples:
        if get_digit_sum(triple) == digit and triple not in filtered:
            filtered.append(triple)
    
    # Sort: single, double, triple
    single = [p for p in filtered if len(set(p)) == 3]
    double = [p for p in filtered if len(set(p)) == 2]
    triple = [p for p in filtered if len(set(p)) == 1]
    
    return sorted(single) + sorted(double) + sorted(triple)


# Pre-generate all pana for each digit
all_pana_by_digit = {i: get_pana_for_digit(i) for i in range(10)}


def generate_random_result():
    """Generate a random result in format XXX-X using pana from PanaDashboard"""
    # Pick a random digit (0-9) for the digit sum
    digit = random.randint(0, 9)
    # Get pana from that digit's list
    pana = random.choice(all_pana_by_digit[digit])
    # Calculate ank: sum of all digits, take unit digit
    digit_sum = sum(int(d) for d in pana)
    ank = digit_sum % 10
    return f"{pana}-{ank}"


def generate_demo_data():
    """Generate demo data for the last 3 months"""
    print("Creating database session...")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if games exist, if not create sample games
        games = GameService.get_all_games(db)
        
        if not games:
            print("No games found. Creating sample games...")
            sample_games = [
                {"name": "Morning Game", "open_time": "10:00:00", "close_time": "12:00:00"},
                {"name": "Afternoon Game", "open_time": "14:00:00", "close_time": "16:00:00"},
                {"name": "Evening Game", "open_time": "18:00:00", "close_time": "20:00:00"},
                {"name": "Night Game", "open_time": "21:00:00", "close_time": "23:00:00"},
            ]
            
            for game_data in sample_games:
                game_create = GameCreate(**game_data)
                GameService.create_game(db, game_create)
                print(f"Created game: {game_data['name']}")
            
            games = GameService.get_all_games(db)
        
        print(f"Found {len(games)} games")
        
        # Generate results for the last 3 months
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)  # 3 months
        
        print(f"\nGenerating demo results from {start_date.date()} to {end_date.date()}...")
        
        total_results = 0
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            
            for game in games:
                # Generate both open and close results for each day
                open_result = generate_random_result()
                close_result = generate_random_result()
                
                # Create Open result
                try:
                    open_data = ResultCreate(
                        game_id=game.id,
                        result=open_result,
                        result_date=date_str,
                        status="closed",
                        result_type="open"
                    )
                    ResultService.create_result(db, open_data)
                    total_results += 1
                except Exception as e:
                    print(f"Skipping duplicate open result for game {game.id} on {date_str}")
                
                # Create Close result
                try:
                    close_data = ResultCreate(
                        game_id=game.id,
                        result=close_result,
                        result_date=date_str,
                        status="closed",
                        result_type="close"
                    )
                    ResultService.create_result(db, close_data)
                    total_results += 1
                except Exception as e:
                    print(f"Skipping duplicate close result for game {game.id} on {date_str}")
            
            # Progress update every 30 days
            if current_date.day == 1 or current_date == end_date:
                print(f"  Processed: {date_str} ({total_results} results so far)")
            
            current_date += timedelta(days=1)
        
        db.commit()
        print(f"\n✓ Demo data generation complete!")
        print(f"  Total results created: {total_results}")
        print(f"  Date range: {start_date.date()} to {end_date.date()}")
        print(f"  Games: {len(games)}")
        
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error generating demo data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def delete_demo_data():
    """Delete all results from the database"""
    print("Creating database session...")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Delete all results
        db.query(Result).delete()
        db.commit()
        print("✓ All demo data deleted successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error deleting demo data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("DEMO DATA GENERATOR")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == "delete":
        print("Deleting all demo data...")
        delete_demo_data()
    else:
        print("Generating 6 months of demo data...")
        print()
        generate_demo_data()
