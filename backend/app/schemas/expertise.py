from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ExpertiseBase(BaseModel):
    expertise_name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class ExpertiseCreate(ExpertiseBase):
    pass


class ExpertiseUpdate(BaseModel):
    expertise_name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ExpertiseResponse(ExpertiseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    resource_person_count: Optional[int] = 0

