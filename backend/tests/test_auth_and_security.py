import pytest
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hashing():
    password = "Admin@Cbit2025!"
    hashed = hash_password(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_generation_and_validation():
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "email": "admin@cbit.ac.in",
        "role": "ADMIN",
        "can_create_records": True,
        "can_edit_records": True
    }
    token = create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == payload["sub"]
    assert decoded["email"] == payload["email"]
    assert decoded["role"] == "ADMIN"
    assert decoded["can_create_records"] is True


def test_jwt_invalid_token():
    invalid_token = "invalid.bearer.token"
    decoded = decode_access_token(invalid_token)
    assert decoded is None

