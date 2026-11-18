from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPayload(BaseModel):
    sub: str  # user id as str
    email: str
    role: str
    can_create_records: bool
    can_edit_records: bool
    exp: Optional[int] = None


class UserProfileResponse(BaseModel):
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


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

