from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
import psycopg

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.repositories.department_repository import DepartmentRepository
from app.schemas.department import DepartmentCreate, DepartmentResponse, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("", response_model=List[DepartmentResponse])
def list_departments(
    active_only: bool = Query(False, description="Filter only active departments"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """List all college departments."""
    dept_repo = DepartmentRepository(conn)
    return dept_repo.list_all(active_only=active_only)


@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department(
    dept_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get department details by ID."""
    dept_repo = DepartmentRepository(conn)
    dept = dept_repo.get_by_id(dept_id)
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )
    return dept


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Create a new department. (Admin only)"""
    dept_repo = DepartmentRepository(conn)
    return dept_repo.create(
        name=payload.department_name,
        code=payload.department_code,
        description=payload.description,
        is_active=payload.is_active
    )


@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: UUID,
    payload: DepartmentUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Update department information. (Admin only)"""
    dept_repo = DepartmentRepository(conn)
    existing = dept_repo.get_by_id(dept_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found.",
        )
    return dept_repo.update(
        dept_id=dept_id,
        name=payload.department_name,
        code=payload.department_code,
        description=payload.description,
        is_active=payload.is_active
    )


@router.delete("/{dept_id}")
def delete_department(
    dept_id: UUID,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, str]:
    """Delete an empty department. (Admin only)"""
    dept_repo = DepartmentRepository(conn)
    success = dept_repo.delete(dept_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete department: Staff members are assigned to it.",
        )
    return {"message": "Department deleted successfully."}

