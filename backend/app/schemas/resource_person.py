from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# ------------------------------------------------------------------------------
# Organisation Associations
# ------------------------------------------------------------------------------
class PersonOrganisationItem(BaseModel):
    organisation_id: UUID
    designation: str = Field(..., min_length=1, max_length=150)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = True


class PersonOrganisationDetail(PersonOrganisationItem):
    id: UUID
    organisation_name: str
    organisation_type: Optional[str] = None
    website: Optional[str] = None


# ------------------------------------------------------------------------------
# Expertise Associations
# ------------------------------------------------------------------------------
class PersonExpertiseDetail(BaseModel):
    id: UUID
    expertise_name: str
    category: str


# ------------------------------------------------------------------------------
# Resource Person Core
# ------------------------------------------------------------------------------
class ResourcePersonBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    designation: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    mobile_number: str = Field(..., min_length=7, max_length=30)
    address: Optional[str] = None
    professional_biography: Optional[str] = None
    professional_profile_url: Optional[str] = None


class ResourcePersonCreate(ResourcePersonBase):
    organisations: List[PersonOrganisationItem] = []
    expertise_ids: List[UUID] = []


class ResourcePersonUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    designation: Optional[str] = Field(None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = Field(None, min_length=7, max_length=30)
    address: Optional[str] = None
    professional_biography: Optional[str] = None
    professional_profile_url: Optional[str] = None
    organisations: Optional[List[PersonOrganisationItem]] = None
    expertise_ids: Optional[List[UUID]] = None


class ApprovalActionRequest(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$")
    rejection_reason: Optional[str] = None
    comments: Optional[str] = None


class ApprovalHistoryItem(BaseModel):
    id: UUID
    action: str
    previous_status: Optional[str] = None
    new_status: str
    reviewed_by: Optional[UUID] = None
    reviewer_name: Optional[str] = None
    comments: Optional[str] = None
    created_at: datetime


class ResourcePersonListItem(ResourcePersonBase):
    id: UUID
    approval_status: str
    created_at: datetime
    updated_at: datetime
    organisations: List[PersonOrganisationDetail] = []
    expertise: List[PersonExpertiseDetail] = []


class ResourcePersonDetail(ResourcePersonListItem):
    rejection_reason: Optional[str] = None
    created_by: Optional[UUID] = None
    creator_name: Optional[str] = None
    reviewed_by: Optional[UUID] = None
    reviewer_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    approval_history: List[ApprovalHistoryItem] = []


class PaginatedResourcePersons(BaseModel):
    items: List[ResourcePersonListItem]
    total: int
    page: int
    limit: int
    total_pages: int

