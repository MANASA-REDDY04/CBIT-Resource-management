import math
from typing import Any, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
import psycopg

from app.core.database import get_db
from app.dependencies.auth import (
    get_current_user,
    require_admin,
    require_can_create,
    require_can_edit,
)
from app.repositories.resource_person_repository import ResourcePersonRepository
from app.schemas.resource_person import (
    PaginatedResourcePersons,
    PersonExpertiseDetail,
    PersonOrganisationDetail,
    ResourcePersonCreate,
    ResourcePersonDetail,
    ResourcePersonListItem,
    ResourcePersonUpdate,
)

router = APIRouter(prefix="/resource-persons", tags=["Resource Persons"])


@router.get("", response_model=PaginatedResourcePersons)
def search_resource_persons(
    q: Optional[str] = Query(None, description="Global search query across name, org, expertise, designation"),
    full_name: Optional[str] = Query(None, description="Filter by full name"),
    organisation: Optional[str] = Query(None, description="Filter by associated organisation"),
    expertise: Optional[str] = Query(None, description="Filter by area of expertise"),
    designation: Optional[str] = Query(None, description="Filter by designation"),
    address: Optional[str] = Query(None, description="Filter by address / location"),
    email: Optional[str] = Query(None, description="Filter by email address"),
    mobile: Optional[str] = Query(None, description="Filter by mobile number"),
    approval_status: Optional[str] = Query("APPROVED", description="Filter by status (default APPROVED)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("DESC", description="Sort order: ASC or DESC"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """
    Search approved resource persons with combined filters.
    Only ADMIN users can view non-APPROVED profiles through this general endpoint.
    """
    # Non-admin users cannot query for PENDING or REJECTED via general directory
    if approval_status != "APPROVED" and current_user.get("role") != "ADMIN":
        approval_status = "APPROVED"

    offset = (page - 1) * limit
    rp_repo = ResourcePersonRepository(conn)

    items = rp_repo.search_resource_persons(
        limit=limit,
        offset=offset,
        q=q,
        full_name=full_name,
        organisation=organisation,
        expertise=expertise,
        designation=designation,
        address=address,
        email=email,
        mobile=mobile,
        approval_status=approval_status,
        sort_by=sort_by,
        sort_order=sort_order
    )

    total = rp_repo.count_search_resource_persons(
        q=q,
        full_name=full_name,
        organisation=organisation,
        expertise=expertise,
        designation=designation,
        address=address,
        email=email,
        mobile=mobile,
        approval_status=approval_status
    )

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@router.get("/my/submissions", response_model=List[ResourcePersonListItem])
def get_my_submissions(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Return submissions created by the currently authenticated user."""
    rp_repo = ResourcePersonRepository(conn)
    return rp_repo.search_resource_persons(
        limit=100,
        offset=0,
        approval_status=None,  # All statuses created by this user
        created_by=current_user["id"]
    )


@router.get("/{rp_id}", response_model=ResourcePersonDetail)
def get_resource_person_detail(
    rp_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Get full profile details of a resource person."""
    rp_repo = ResourcePersonRepository(conn)
    profile = rp_repo.get_by_id(rp_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource person profile not found.",
        )

    # If profile is not APPROVED, only ADMIN or the creator can view it
    if profile["approval_status"] != "APPROVED":
        if current_user.get("role") != "ADMIN" and str(profile.get("created_by")) != str(current_user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: This profile is pending administrative review.",
            )

    return profile


@router.post("", response_model=ResourcePersonDetail, status_code=status.HTTP_201_CREATED)
def create_resource_person(
    payload: ResourcePersonCreate,
    current_user: Dict[str, Any] = Depends(require_can_create),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """
    Create a new resource person.
    Submissions by Authorised Faculty automatically default to PENDING status.
    Admin submissions can be immediately APPROVED or PENDING.
    """
    rp_repo = ResourcePersonRepository(conn)

    # Determine status: Admin creates as APPROVED by default unless specified; Faculty always PENDING
    status_to_set = "APPROVED" if current_user.get("role") == "ADMIN" else "PENDING"

    org_data = [item.model_dump() for item in payload.organisations]

    created = rp_repo.create_resource_person(
        full_name=payload.full_name,
        designation=payload.designation,
        email=payload.email,
        mobile_number=payload.mobile_number,
        address=payload.address,
        professional_biography=payload.professional_biography,
        professional_profile_url=payload.professional_profile_url,
        created_by=current_user["id"],
        approval_status=status_to_set,
        organisations=org_data,
        expertise_ids=payload.expertise_ids
    )

    return created


@router.put("/{rp_id}", response_model=ResourcePersonDetail)
def update_resource_person(
    rp_id: UUID,
    payload: ResourcePersonUpdate,
    current_user: Dict[str, Any] = Depends(require_can_edit),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """
    Update resource person profile.
    Admin can edit any record. Authorised faculty can edit if permitted.
    """
    rp_repo = ResourcePersonRepository(conn)
    existing = rp_repo.get_by_id(rp_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource person profile not found.",
        )

    # If faculty, ensure they created it or have explicit edit permission
    if current_user.get("role") != "ADMIN":
        if str(existing.get("created_by")) != str(current_user["id"]) and not current_user.get("can_edit_records"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit this profile.",
            )

    org_data = [item.model_dump() for item in payload.organisations] if payload.organisations is not None else None

    updated = rp_repo.update_resource_person(
        rp_id=rp_id,
        full_name=payload.full_name,
        designation=payload.designation,
        email=payload.email,
        mobile_number=payload.mobile_number,
        address=payload.address,
        professional_biography=payload.professional_biography,
        professional_profile_url=payload.professional_profile_url,
        organisations=org_data,
        expertise_ids=payload.expertise_ids,
        updated_by=current_user["id"]
    )

    return updated


@router.delete("/{rp_id}")
def delete_resource_person(
    rp_id: UUID,
    current_user: Dict[str, Any] = Depends(require_admin),
    conn: psycopg.Connection = Depends(get_db)
) -> Dict[str, str]:
    """Delete a resource person profile. (Admin only)"""
    rp_repo = ResourcePersonRepository(conn)
    existing = rp_repo.get_by_id(rp_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource person not found.",
        )

    rp_repo.delete_resource_person(rp_id)
    return {"message": "Resource person profile deleted successfully."}


@router.get("/{rp_id}/organisations", response_model=List[PersonOrganisationDetail])
def get_resource_person_organisations(
    rp_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve organisation history for a resource person."""
    rp_repo = ResourcePersonRepository(conn)
    return rp_repo.get_organisations_for_person(rp_id)


@router.get("/{rp_id}/expertise", response_model=List[PersonExpertiseDetail])
def get_resource_person_expertise(
    rp_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve expertise tags for a resource person."""
    rp_repo = ResourcePersonRepository(conn)
    return rp_repo.get_expertise_for_person(rp_id)

