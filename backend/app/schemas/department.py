from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class DepartmentBase(BaseModel):
    department_name: str = Field(..., min_length=2, max_length=150)
    department_code: str = Field(..., min_length=2, max_length=20)
    description: Optional[str] = None
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    department_name: Optional[str] = Field(None, min_length=2, max_length=150)
    department_code: Optional[str] = Field(None, min_length=2, max_length=20)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    staff_count: Optional[int] = 0

