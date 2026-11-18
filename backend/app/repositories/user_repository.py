from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID
import psycopg
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                u.id, u.full_name, u.email, u.password_hash, u.employee_id,
                u.department_id, u.role, u.can_create_records, u.can_edit_records,
                u.is_active, u.last_login_at, u.created_at, u.updated_at,
                d.department_name, d.department_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE LOWER(u.email) = LOWER(%s);
        """
        return self.execute_one(query, (email.strip(),))

    def get_by_id(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                u.id, u.full_name, u.email, u.employee_id,
                u.department_id, u.role, u.can_create_records, u.can_edit_records,
                u.is_active, u.last_login_at, u.created_at, u.updated_at,
                d.department_name, d.department_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = %s;
        """
        return self.execute_one(query, (str(user_id),))

    def list_users(
        self,
        limit: int = 50,
        offset: int = 0,
        search: Optional[str] = None,
        role: Optional[str] = None,
        department_id: Optional[UUID] = None,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        conditions = ["1=1"]
        params: List[Any] = []

        if search:
            conditions.append("(u.full_name ILIKE %s OR u.email ILIKE %s OR u.employee_id ILIKE %s)")
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern, pattern])

        if role:
            conditions.append("u.role = %s")
            params.append(role)

        if department_id:
            conditions.append("u.department_id = %s")
            params.append(str(department_id))

        if is_active is not None:
            conditions.append("u.is_active = %s")
            params.append(is_active)

        params.extend([limit, offset])

        query = f"""
            SELECT 
                u.id, u.full_name, u.email, u.employee_id,
                u.department_id, u.role, u.can_create_records, u.can_edit_records,
                u.is_active, u.last_login_at, u.created_at, u.updated_at,
                d.department_name, d.department_code
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE {' AND '.join(conditions)}
            ORDER BY u.created_at DESC
            LIMIT %s OFFSET %s;
        """
        return self.execute_query(query, tuple(params))

    def count_users(
        self,
        search: Optional[str] = None,
        role: Optional[str] = None,
        department_id: Optional[UUID] = None,
        is_active: Optional[bool] = None
    ) -> int:
        conditions = ["1=1"]
        params: List[Any] = []

        if search:
            conditions.append("(u.full_name ILIKE %s OR u.email ILIKE %s OR u.employee_id ILIKE %s)")
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern, pattern])

        if role:
            conditions.append("u.role = %s")
            params.append(role)

        if department_id:
            conditions.append("u.department_id = %s")
            params.append(str(department_id))

        if is_active is not None:
            conditions.append("u.is_active = %s")
            params.append(is_active)

        query = f"""
            SELECT COUNT(*) AS total
            FROM users u
            WHERE {' AND '.join(conditions)};
        """
        result = self.execute_one(query, tuple(params))
        return result["total"] if result else 0

    def create_user(
        self,
        full_name: str,
        email: str,
        password_hash: str,
        role: str,
        employee_id: Optional[str] = None,
        department_id: Optional[UUID] = None,
        can_create_records: bool = False,
        can_edit_records: bool = False,
        is_active: bool = True
    ) -> Dict[str, Any]:
        query = """
            INSERT INTO users (
                full_name, email, password_hash, employee_id,
                department_id, role, can_create_records, can_edit_records, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, full_name, email, employee_id, department_id, role,
                      can_create_records, can_edit_records, is_active, created_at, updated_at;
        """
        params = (
            full_name.strip(),
            email.strip().lower(),
            password_hash,
            employee_id.strip() if employee_id else None,
            str(department_id) if department_id else None,
            role,
            can_create_records,
            can_edit_records,
            is_active
        )
        return self.execute_one(query, params)

    def update_user(
        self,
        user_id: UUID,
        full_name: Optional[str] = None,
        email: Optional[str] = None,
        employee_id: Optional[str] = None,
        department_id: Optional[UUID] = None,
        role: Optional[str] = None,
        can_create_records: Optional[bool] = None,
        can_edit_records: Optional[bool] = None,
        password_hash: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Optional[Dict[str, Any]]:
        fields = ["updated_at = CURRENT_TIMESTAMP"]
        params: List[Any] = []

        if full_name is not None:
            fields.append("full_name = %s")
            params.append(full_name.strip())

        if email is not None:
            fields.append("email = %s")
            params.append(email.strip().lower())

        if employee_id is not None:
            fields.append("employee_id = %s")
            params.append(employee_id.strip())

        if department_id is not None:
            fields.append("department_id = %s")
            params.append(str(department_id))

        if role is not None:
            fields.append("role = %s")
            params.append(role)

        if can_create_records is not None:
            fields.append("can_create_records = %s")
            params.append(can_create_records)

        if can_edit_records is not None:
            fields.append("can_edit_records = %s")
            params.append(can_edit_records)

        if password_hash is not None:
            fields.append("password_hash = %s")
            params.append(password_hash)

        if is_active is not None:
            fields.append("is_active = %s")
            params.append(is_active)

        params.append(str(user_id))

        query = f"""
            UPDATE users
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, full_name, email, employee_id, department_id, role,
                      can_create_records, can_edit_records, is_active, created_at, updated_at;
        """
        return self.execute_one(query, tuple(params))

    def update_status(self, user_id: UUID, is_active: bool) -> Optional[Dict[str, Any]]:
        query = """
            UPDATE users
            SET is_active = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, full_name, email, is_active, role;
        """
        return self.execute_one(query, (is_active, str(user_id)))

    def update_permissions(
        self,
        user_id: UUID,
        role: Optional[str] = None,
        can_create_records: Optional[bool] = None,
        can_edit_records: Optional[bool] = None
    ) -> Optional[Dict[str, Any]]:
        fields = ["updated_at = CURRENT_TIMESTAMP"]
        params: List[Any] = []

        if role is not None:
            fields.append("role = %s")
            params.append(role)

        if can_create_records is not None:
            fields.append("can_create_records = %s")
            params.append(can_create_records)

        if can_edit_records is not None:
            fields.append("can_edit_records = %s")
            params.append(can_edit_records)

        params.append(str(user_id))

        query = f"""
            UPDATE users
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, full_name, email, role, can_create_records, can_edit_records;
        """
        return self.execute_one(query, tuple(params))

    def update_last_login(self, user_id: UUID) -> None:
        query = """
            UPDATE users
            SET last_login_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """
        self.execute_commit(query, (str(user_id),))

    def create_session(
        self,
        user_id: UUID,
        session_token: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        query = """
            INSERT INTO user_sessions (user_id, session_token, expires_at, user_agent, ip_address)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, user_id, session_token, expires_at;
        """
        return self.execute_one(query, (str(user_id), session_token, expires_at, user_agent, ip_address))

    def delete_session(self, session_token: str) -> None:
        query = "DELETE FROM user_sessions WHERE session_token = %s;"
        self.execute_commit(query, (session_token,))

