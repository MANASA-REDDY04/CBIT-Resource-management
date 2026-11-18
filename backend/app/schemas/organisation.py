from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl


class OrganisationBase(BaseModel):
    organisation_name: str = Field(..., min_length=2, max_length=255)
    organisation_type: str = Field("Corporate", max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True


class OrganisationCreate(OrganisationBase):
    pass


class OrganisationUpdate(BaseModel):
    organisation_name: Optional[str] = Field(None, min_length=2, max_length=255)
    organisation_type: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class OrganisationResponse(OrganisationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    resource_person_count: Optional[int] = 0

