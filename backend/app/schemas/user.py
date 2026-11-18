from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    employee_id: Optional[str] = Field(None, max_length=50)
    department_id: Optional[UUID] = None
    role: str = Field("GENERAL_STAFF", pattern="^(ADMIN|AUTHORISED_FACULTY|GENERAL_STAFF)$")
    can_create_records: bool = False
    can_edit_records: bool = False
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    employee_id: Optional[str] = None
    department_id: Optional[UUID] = None
    role: Optional[str] = Field(None, pattern="^(ADMIN|AUTHORISED_FACULTY|GENERAL_STAFF)$")
    can_create_records: Optional[bool] = None
    can_edit_records: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserPermissionsUpdate(BaseModel):
    role: Optional[str] = Field(None, pattern="^(ADMIN|AUTHORISED_FACULTY|GENERAL_STAFF)$")
    can_create_records: Optional[bool] = None
    can_edit_records: Optional[bool] = None


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    employee_id: Optional[str] = None
    department_id: Optional[UUID] = None
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    role: str
    can_create_records: bool
    can_edit_records: bool
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

