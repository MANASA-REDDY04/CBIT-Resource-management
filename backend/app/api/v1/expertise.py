from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
import psycopg

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin, require_can_create
from app.repositories.expertise_repository import ExpertiseRepository
from app.schemas.expertise import ExpertiseCreate, ExpertiseResponse, ExpertiseUpdate

router = APIRouter(prefix="/expertise", tags=["Expertise"])


@router.get("", response_model=List[ExpertiseResponse])
def list_expertise(
    search: Optional[str] = Query(None, description="Search expertise topic name or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter active status"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """List all expertise topics."""
    exp_repo = ExpertiseRepository(conn)
    return exp_repo.list_expertise(
        limit=limit,
        offset=offset,
        search=search,
        category=category,
        is_active=is_active
    )


@router.get("/categories", response_model=List[str])
def list_expertise_categories(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """List unique active expertise categories."""
    exp_repo = ExpertiseRepository(conn)
    return exp_repo.list_categories()


@router.get("/{exp_id}", response_model=ExpertiseResponse)
def get_expertise(
    exp_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get single expertise topic."""
    exp_repo = ExpertiseRepository(conn)
    item = exp_repo.get_by_id(exp_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expertise topic not found.",
        )
    return item


@router.post("", response_model=ExpertiseResponse, status_code=status.HTTP_201_CREATED)
def create_expertise(
    payload: ExpertiseCreate,
    current_user: Dict[str, Any] = Depends(require_can_create),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Create a new expertise topic. (Admin or Authorised Faculty)"""
    exp_repo = ExpertiseRepository(conn)
    existing = exp_repo.get_by_name(payload.expertise_name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Expertise '{payload.expertise_name}' already exists.",
        )

    return exp_repo.create(
        name=payload.expertise_name,
        category=payload.category,
        description=payload.description,
        is_active=payload.is_active
    )


@router.put("/{exp_id}", response_model=ExpertiseResponse)
def update_expertise(
    exp_id: UUID,
    payload: ExpertiseUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Update an expertise topic. (Admin only)"""
    exp_repo = ExpertiseRepository(conn)
    existing = exp_repo.get_by_id(exp_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expertise topic not found.",
        )

    if payload.expertise_name and payload.expertise_name.lower() != existing["expertise_name"].lower():
        duplicate = exp_repo.get_by_name(payload.expertise_name)
        if duplicate and str(duplicate["id"]) != str(exp_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Expertise '{payload.expertise_name}' already exists.",
            )

    return exp_repo.update(
        exp_id=exp_id,
        name=payload.expertise_name,
        category=payload.category,
        description=payload.description,
        is_active=payload.is_active
    )


@router.delete("/{exp_id}")
def delete_expertise(
    exp_id: UUID,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, str]:
    """Delete an expertise topic if no resource persons are linked. (Admin only)"""
    exp_repo = ExpertiseRepository(conn)
    success = exp_repo.delete(exp_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete expertise topic: Resource persons are currently associated with it. Deactivate instead.",
        )
    return {"message": "Expertise topic deleted successfully."}


@router.get("/{exp_id}/resource-persons")
def get_expertise_resource_persons(
    exp_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get approved resource persons who have this expertise."""
    exp_repo = ExpertiseRepository(conn)
    item = exp_repo.get_by_id(exp_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expertise topic not found.",
        )
    return exp_repo.get_associated_resource_persons(exp_id)

