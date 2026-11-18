from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
import psycopg

from app.core.database import get_db
from app.core.security import hash_password
from app.dependencies.auth import require_admin
from app.repositories.approval_repository import ApprovalRepository
from app.repositories.user_repository import UserRepository
from app.schemas.resource_person import ApprovalActionRequest, ResourcePersonDetail
from app.schemas.user import (
    UserCreate,
    UserPermissionsUpdate,
    UserResponse,
    UserStatusUpdate,
    UserUpdate,
)

router = APIRouter(prefix="/admin", tags=["Admin Management"], dependencies=[Depends(require_admin)])


# ==============================================================================
# 1. APPROVAL WORKFLOW ENDPOINTS
# ==============================================================================
@router.get("/approvals/pending")
def list_pending_approvals(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve all profiles awaiting administrative approval."""
    approval_repo = ApprovalRepository(conn)
    items = approval_repo.get_by_status("PENDING", limit=limit, offset=offset)
    total = approval_repo.count_by_status("PENDING")
    return {"items": items, "total": total}


@router.get("/approvals/approved")
def list_approved_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve approved profile history."""
    approval_repo = ApprovalRepository(conn)
    items = approval_repo.get_by_status("APPROVED", limit=limit, offset=offset)
    total = approval_repo.count_by_status("APPROVED")
    return {"items": items, "total": total}


@router.get("/approvals/rejected")
def list_rejected_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve rejected profile history."""
    approval_repo = ApprovalRepository(conn)
    items = approval_repo.get_by_status("REJECTED", limit=limit, offset=offset)
    total = approval_repo.count_by_status("REJECTED")
    return {"items": items, "total": total}


@router.post("/approvals/{rp_id}/approve")
def approve_profile(
    rp_id: UUID,
    payload: Optional[ApprovalActionRequest] = None,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """Approve a submitted resource person profile."""
    approval_repo = ApprovalRepository(conn)
    comments = payload.comments if payload else "Approved by administrator"
    result = approval_repo.approve_profile(
        rp_id=rp_id,
        reviewer_id=current_user["id"],
        comments=comments
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource person profile not found.",
        )
    return {"message": "Resource person profile approved successfully.", "data": result}


@router.post("/approvals/{rp_id}/reject")
def reject_profile(
    rp_id: UUID,
    payload: ApprovalActionRequest,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """Reject a submitted profile with mandatory rejection reason."""
    if not payload.rejection_reason or not payload.rejection_reason.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A rejection reason is required.",
        )

    approval_repo = ApprovalRepository(conn)
    result = approval_repo.reject_profile(
        rp_id=rp_id,
        reviewer_id=current_user["id"],
        rejection_reason=payload.rejection_reason.strip(),
        comments=payload.comments
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource person profile not found.",
        )
    return {"message": "Resource person profile rejected.", "data": result}


# ==============================================================================
# 2. USER MANAGEMENT ENDPOINTS
# ==============================================================================
@router.get("/users")
def list_users(
    search: Optional[str] = Query(None, description="Search name, email, employee ID"),
    role: Optional[str] = Query(None, description="Filter by role: ADMIN, AUTHORISED_FACULTY, GENERAL_STAFF"),
    department_id: Optional[UUID] = Query(None, description="Filter by department"),
    is_active: Optional[bool] = Query(None, description="Filter active status"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """List staff user accounts with filters and pagination."""
    offset = (page - 1) * limit
    user_repo = UserRepository(conn)
    users = user_repo.list_users(
        limit=limit,
        offset=offset,
        search=search,
        role=role,
        department_id=department_id,
        is_active=is_active
    )
    total = user_repo.count_users(
        search=search,
        role=role,
        department_id=department_id,
        is_active=is_active
    )
    return {"items": users, "total": total, "page": page, "limit": limit}


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Create a new staff account with hashed password and permissions."""
    user_repo = UserRepository(conn)
    existing = user_repo.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists.",
        )

    # Automatically set can_create_records for ADMIN
    can_create = payload.can_create_records or (payload.role in ["ADMIN", "AUTHORISED_FACULTY"])
    can_edit = payload.can_edit_records or (payload.role == "ADMIN")

    pwd_hash = hash_password(payload.password)
    new_user = user_repo.create_user(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=pwd_hash,
        role=payload.role,
        employee_id=payload.employee_id,
        department_id=payload.department_id,
        can_create_records=can_create,
        can_edit_records=can_edit,
        is_active=payload.is_active
    )
    return new_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get user details by ID."""
    user_repo = UserRepository(conn)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Update user information, department, role, or password."""
    user_repo = UserRepository(conn)
    existing = user_repo.get_by_id(user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    if payload.email and payload.email.lower() != existing["email"].lower():
        duplicate = user_repo.get_by_email(payload.email)
        if duplicate and str(duplicate["id"]) != str(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{payload.email}' is already in use.",
            )

    pwd_hash = hash_password(payload.password) if payload.password else None

    updated = user_repo.update_user(
        user_id=user_id,
        full_name=payload.full_name,
        email=payload.email,
        employee_id=payload.employee_id,
        department_id=payload.department_id,
        role=payload.role,
        can_create_records=payload.can_create_records,
        can_edit_records=payload.can_edit_records,
        password_hash=pwd_hash
    )
    return updated


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: UUID,
    payload: UserStatusUpdate,
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """Activate or deactivate a user account."""
    user_repo = UserRepository(conn)
    result = user_repo.update_status(user_id, payload.is_active)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )
    state = "activated" if payload.is_active else "deactivated"
    return {"message": f"User account has been {state}.", "data": result}


@router.patch("/users/{user_id}/permissions")
def update_user_permissions(
    user_id: UUID,
    payload: UserPermissionsUpdate,
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, Any]:
    """Grant or revoke user permissions or update role."""
    user_repo = UserRepository(conn)
    result = user_repo.update_permissions(
        user_id=user_id,
        role=payload.role,
        can_create_records=payload.can_create_records,
        can_edit_records=payload.can_edit_records
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )
    return {"message": "User permissions updated successfully.", "data": result}

