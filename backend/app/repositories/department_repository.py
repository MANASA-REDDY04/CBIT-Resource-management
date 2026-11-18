from typing import Any, Dict, List, Optional
from uuid import UUID
from app.repositories.base import BaseRepository


class DepartmentRepository(BaseRepository):
    def list_all(self, active_only: bool = False) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                d.id, d.department_name, d.department_code, d.description, d.is_active,
                d.created_at, d.updated_at,
                COUNT(u.id) AS staff_count
            FROM departments d
            LEFT JOIN users u ON u.department_id = d.id
        """
        params = ()
        if active_only:
            query += " WHERE d.is_active = TRUE "
        query += """
            GROUP BY d.id
            ORDER BY d.department_name ASC;
        """
        return self.execute_query(query, params)

    def get_by_id(self, dept_id: UUID) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                d.id, d.department_name, d.department_code, d.description, d.is_active,
                d.created_at, d.updated_at,
                COUNT(u.id) AS staff_count
            FROM departments d
            LEFT JOIN users u ON u.department_id = d.id
            WHERE d.id = %s
            GROUP BY d.id;
        """
        return self.execute_one(query, (str(dept_id),))

    def create(self, name: str, code: str, description: Optional[str] = None, is_active: bool = True) -> Dict[str, Any]:
        query = """
            INSERT INTO departments (department_name, department_code, description, is_active)
            VALUES (%s, %s, %s, %s)
            RETURNING id, department_name, department_code, description, is_active, created_at, updated_at;
        """
        return self.execute_one(query, (name.strip(), code.strip().upper(), description, is_active))

    def update(
        self,
        dept_id: UUID,
        name: Optional[str] = None,
        code: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Optional[Dict[str, Any]]:
        fields = ["updated_at = CURRENT_TIMESTAMP"]
        params = []

        if name is not None:
            fields.append("department_name = %s")
            params.append(name.strip())

        if code is not None:
            fields.append("department_code = %s")
            params.append(code.strip().upper())

        if description is not None:
            fields.append("description = %s")
            params.append(description)

        if is_active is not None:
            fields.append("is_active = %s")
            params.append(is_active)

        params.append(str(dept_id))

        query = f"""
            UPDATE departments
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, department_name, department_code, description, is_active, created_at, updated_at;
        """
        return self.execute_one(query, tuple(params))

    def delete(self, dept_id: UUID) -> bool:
        # Check if staff members are assigned
        query_check = "SELECT COUNT(*) AS count FROM users WHERE department_id = %s;"
        res = self.execute_one(query_check, (str(dept_id),))
        if res and res["count"] > 0:
            return False
        query = "DELETE FROM departments WHERE id = %s;"
        self.execute_commit(query, (str(dept_id),))
        return True

