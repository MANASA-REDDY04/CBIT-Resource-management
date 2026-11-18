import pytest
from pydantic import ValidationError
from app.schemas.auth import LoginRequest
from app.schemas.department import DepartmentCreate
from app.schemas.expertise import ExpertiseCreate
from app.schemas.organisation import OrganisationCreate
from app.schemas.resource_person import ResourcePersonCreate
from app.schemas.user import UserCreate


def test_user_create_validation():
    user = UserCreate(
        full_name="Dr. Test Faculty",
        email="test.faculty@cbit.ac.in",
        password="SecurePassword123!",
        role="AUTHORISED_FACULTY",
        employee_id="FAC-999"
    )
    assert user.full_name == "Dr. Test Faculty"
    assert user.email == "test.faculty@cbit.ac.in"
    assert user.role == "AUTHORISED_FACULTY"


def test_invalid_email_validation():
    with pytest.raises(ValidationError):
        UserCreate(
            full_name="Invalid User",
            email="not-an-email",
            password="SecurePassword123!",
            role="GENERAL_STAFF"
        )


def test_resource_person_validation():
    rp = ResourcePersonCreate(
        full_name="Dr. Expert Person",
        designation="Principal AI Researcher",
        email="expert@industry.com",
        mobile_number="+91 9988776655",
        organisations=[],
        expertise_ids=[]
    )
    assert rp.full_name == "Dr. Expert Person"
    assert rp.mobile_number == "+91 9988776655"


def test_department_validation():
    dept = DepartmentCreate(
        department_name="Mechanical Engineering",
        department_code="MECH",
        description="Core branch"
    )
    assert dept.department_code == "MECH"

