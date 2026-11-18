from typing import Any, Dict, Optional
from uuid import UUID
from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import psycopg

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.repositories.user_repository import UserRepository

# Optional bearer scheme so cookies also work seamlessly
security_bearer = HTTPBearer(auto_error=False)


def get_token_from_request(
    request: Request,
    bearer: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    cookie_token: Optional[str] = Cookie(None, alias=settings.AUTH_COOKIE_NAME)
) -> Optional[str]:
    """
    Extract JWT token either from Authorization Header (Bearer token) or HTTP-only Cookie.
    """
    if bearer and bearer.credentials:
        return bearer.credentials
    if cookie_token:
        return cookie_token
    # Also check Authorization header directly if needed
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """
    Extracts and validates current authenticated user from PostgreSQL.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication payload.",
        )

    user_repo = UserRepository(conn)
    user = user_repo.get_by_id(UUID(user_id_str))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
        )

    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive. Please contact the administrator.",
        )

    return user


def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Restricts access to System Administrators only."""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to perform this action.",
        )
    return current_user


def require_can_create(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Allows Admin or Authorised Faculty with can_create_records permission."""
    if current_user.get("role") == "ADMIN" or current_user.get("can_create_records"):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to create resource person profiles.",
    )


def require_can_edit(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Allows Admin or Authorised Faculty with can_edit_records permission."""
    if current_user.get("role") == "ADMIN" or current_user.get("can_edit_records"):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to edit records.",
    )

