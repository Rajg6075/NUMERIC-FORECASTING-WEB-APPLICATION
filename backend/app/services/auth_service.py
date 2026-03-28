"""
Authentication service - contains business logic for admin authentication.
"""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.models.admin import Admin
from app.schemas.admin import AdminLogin

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class AuthService:
    """Service class for authentication operations."""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password."""
        # Truncate password to 72 bytes for bcrypt compatibility
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password using bcrypt directly."""
        # Truncate password to 72 bytes for bcrypt compatibility
        password_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Optional[str]:
        """Decode a JWT token and return the username."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                return None
            return username
        except JWTError:
            return None

    @staticmethod
    def get_admin_by_username(db: Session, username: str) -> Optional[Admin]:
        """Get admin by username."""
        return db.query(Admin).filter(Admin.username == username).first()

    @staticmethod
    def authenticate_admin(db: Session, login_data: AdminLogin) -> Optional[Admin]:
        """Authenticate admin with username and password."""
        admin = AuthService.get_admin_by_username(db, login_data.username)
        if not admin:
            return None
        if not AuthService.verify_password(login_data.password, admin.password):
            return None
        return admin

    @staticmethod
    def create_admin(db: Session, username: str, password: str) -> Admin:
        """Create a new admin with hashed password."""
        hashed_password = AuthService.get_password_hash(password)
        db_admin = Admin(username=username, password=hashed_password)
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        return db_admin
