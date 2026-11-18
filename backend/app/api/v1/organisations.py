from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
import psycopg

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin, require_can_create
from app.repositories.organisation_repository import OrganisationRepository
from app.schemas.organisation import OrganisationCreate, OrganisationResponse, OrganisationUpdate

router = APIRouter(prefix="/organisations", tags=["Organisations"])


@router.get("", response_model=List[OrganisationResponse])
def list_organisations(
    search: Optional[str] = Query(None, description="Search by name or address"),
    org_type: Optional[str] = Query(None, description="Filter by type (Corporate, Academic, etc.)"),
    is_active: Optional[bool] = Query(None, description="Filter active status"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """List all organisations with optional filtering."""
    org_repo = OrganisationRepository(conn)
    return org_repo.list_organisations(
        limit=limit,
        offset=offset,
        search=search,
        org_type=org_type,
        is_active=is_active
    )


@router.get("/{org_id}", response_model=OrganisationResponse)
def get_organisation(
    org_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get single organisation by UUID."""
    org_repo = OrganisationRepository(conn)
    org = org_repo.get_by_id(org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organisation not found.",
        )
    return org


@router.post("", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
def create_organisation(
    payload: OrganisationCreate,
    current_user: Dict[str, Any] = Depends(require_can_create),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Create a new partner organisation. (Admin or Authorised Faculty)"""
    org_repo = OrganisationRepository(conn)
    existing = org_repo.get_by_name(payload.organisation_name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organisation '{payload.organisation_name}' already exists.",
        )

    return org_repo.create(
        name=payload.organisation_name,
        org_type=payload.organisation_type,
        website=str(payload.website) if payload.website else None,
        address=payload.address,
        description=payload.description,
        is_active=payload.is_active
    )


@router.put("/{org_id}", response_model=OrganisationResponse)
def update_organisation(
    org_id: UUID,
    payload: OrganisationUpdate,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Update organisation details. (Admin only)"""
    org_repo = OrganisationRepository(conn)
    existing = org_repo.get_by_id(org_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organisation not found.",
        )

    if payload.organisation_name and payload.organisation_name.lower() != existing["organisation_name"].lower():
        duplicate = org_repo.get_by_name(payload.organisation_name)
        if duplicate and str(duplicate["id"]) != str(org_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Organisation '{payload.organisation_name}' already exists.",
            )

    updated = org_repo.update(
        org_id=org_id,
        name=payload.organisation_name,
        org_type=payload.organisation_type,
        website=str(payload.website) if payload.website else None,
        address=payload.address,
        description=payload.description,
        is_active=payload.is_active
    )
    return updated


@router.delete("/{org_id}")
def delete_organisation(
    org_id: UUID,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, str]:
    """Delete an organisation if no resource persons are associated. (Admin only)"""
    org_repo = OrganisationRepository(conn)
    success = org_repo.delete(org_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete organisation: It has associated resource persons. Consider deactivating it instead.",
        )
    return {"message": "Organisation deleted successfully."}


@router.get("/{org_id}/resource-persons")
def get_organisation_resource_persons(
    org_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get approved resource persons associated with this organisation."""
    org_repo = OrganisationRepository(conn)
    org = org_repo.get_by_id(org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organisation not found.",
        )
    return org_repo.get_associated_resource_persons(org_id)

