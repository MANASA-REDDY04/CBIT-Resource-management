from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
import psycopg

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.dependencies.auth import get_current_user
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, LoginResponse, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    response: Response,
    request: Request,
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """
    Authenticate user with email and password.
    Returns JWT token and sets secure HTTP-only cookie.
    """
    user_repo = UserRepository(conn)
    user = user_repo.get_by_email(login_data.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact the administrator.",
        )

    # Generate JWT
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user["role"],
        "can_create_records": user["can_create_records"],
        "can_edit_records": user["can_edit_records"]
    }
    access_token = create_access_token(data=token_payload, expires_delta=expires_delta)

    # Update last login timestamp
    user_repo.update_last_login(user["id"])

    # Create session record in database
    expires_at = datetime.now(timezone.utc) + expires_delta
    user_repo.create_session(
        user_id=user["id"],
        session_token=access_token,
        expires_at=expires_at,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None
    )

    # Set secure HTTP-only cookie
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/logout")
def logout(
    response: Response,
    request: Request,
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, str]:
    """
    Log out user by clearing the HTTP-only cookie and removing database session.
    """
    token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if token:
        try:
            user_repo = UserRepository(conn)
            user_repo.delete_session(token)
        except Exception:
            pass

    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        path="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE
    )
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Return profile information of currently authenticated user."""
    return current_user


@router.get("/session")
def get_session_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Verify active session validity."""
    return {
        "authenticated": True,
        "user_id": str(current_user["id"]),
        "email": current_user["email"],
        "role": current_user["role"]
    }

