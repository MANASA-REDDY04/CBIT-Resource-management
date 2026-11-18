from typing import Any, Dict, List, Optional
from uuid import UUID
from app.repositories.base import BaseRepository


class ExpertiseRepository(BaseRepository):
    def list_expertise(
        self,
        limit: int = 100,
        offset: int = 0,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        conditions = ["1=1"]
        params: List[Any] = []

        if search:
            conditions.append("(e.expertise_name ILIKE %s OR e.description ILIKE %s)")
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern])

        if category:
            conditions.append("e.category = %s")
            params.append(category)

        if is_active is not None:
            conditions.append("e.is_active = %s")
            params.append(is_active)

        params.extend([limit, offset])

        query = f"""
            SELECT 
                e.id, e.expertise_name, e.category, e.description,
                e.is_active, e.created_at, e.updated_at,
                COUNT(DISTINCT CASE WHEN rp.approval_status = 'APPROVED' THEN pe.resource_person_id END) AS resource_person_count
            FROM expertise e
            LEFT JOIN person_expertise pe ON e.id = pe.expertise_id
            LEFT JOIN resource_persons rp ON pe.resource_person_id = rp.id
            WHERE {' AND '.join(conditions)}
            GROUP BY e.id
            ORDER BY e.category ASC, e.expertise_name ASC
            LIMIT %s OFFSET %s;
        """
        return self.execute_query(query, tuple(params))

    def count_expertise(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> int:
        conditions = ["1=1"]
        params: List[Any] = []

        if search:
            conditions.append("(e.expertise_name ILIKE %s OR e.description ILIKE %s)")
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern])

        if category:
            conditions.append("e.category = %s")
            params.append(category)

        if is_active is not None:
            conditions.append("e.is_active = %s")
            params.append(is_active)

        query = f"""
            SELECT COUNT(*) AS total
            FROM expertise e
            WHERE {' AND '.join(conditions)};
        """
        res = self.execute_one(query, tuple(params))
        return res["total"] if res else 0

    def list_categories(self) -> List[str]:
        query = """
            SELECT DISTINCT category 
            FROM expertise 
            WHERE is_active = TRUE 
            ORDER BY category ASC;
        """
        rows = self.execute_query(query)
        return [r["category"] for r in rows]

    def get_by_id(self, exp_id: UUID) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                e.id, e.expertise_name, e.category, e.description,
                e.is_active, e.created_at, e.updated_at,
                COUNT(DISTINCT CASE WHEN rp.approval_status = 'APPROVED' THEN pe.resource_person_id END) AS resource_person_count
            FROM expertise e
            LEFT JOIN person_expertise pe ON e.id = pe.expertise_id
            LEFT JOIN resource_persons rp ON pe.resource_person_id = rp.id
            WHERE e.id = %s
            GROUP BY e.id;
        """
        return self.execute_one(query, (str(exp_id),))

    def get_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT id, expertise_name, category, description, is_active
            FROM expertise
            WHERE LOWER(expertise_name) = LOWER(%s);
        """
        return self.execute_one(query, (name.strip(),))

    def create(
        self,
        name: str,
        category: str,
        description: Optional[str] = None,
        is_active: bool = True
    ) -> Dict[str, Any]:
        query = """
            INSERT INTO expertise (expertise_name, category, description, is_active)
            VALUES (%s, %s, %s, %s)
            RETURNING id, expertise_name, category, description, is_active, created_at, updated_at;
        """
        return self.execute_one(query, (name.strip(), category.strip(), description, is_active))

    def update(
        self,
        exp_id: UUID,
        name: Optional[str] = None,
        category: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Optional[Dict[str, Any]]:
        fields = ["updated_at = CURRENT_TIMESTAMP"]
        params = []

        if name is not None:
            fields.append("expertise_name = %s")
            params.append(name.strip())

        if category is not None:
            fields.append("category = %s")
            params.append(category.strip())

        if description is not None:
            fields.append("description = %s")
            params.append(description)

        if is_active is not None:
            fields.append("is_active = %s")
            params.append(is_active)

        params.append(str(exp_id))

        query = f"""
            UPDATE expertise
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, expertise_name, category, description, is_active, created_at, updated_at;
        """
        return self.execute_one(query, tuple(params))

    def delete(self, exp_id: UUID) -> bool:
        check_q = "SELECT COUNT(*) AS count FROM person_expertise WHERE expertise_id = %s;"
        res = self.execute_one(check_q, (str(exp_id),))
        if res and res["count"] > 0:
            return False
        query = "DELETE FROM expertise WHERE id = %s;"
        self.execute_commit(query, (str(exp_id),))
        return True

    def get_associated_resource_persons(self, exp_id: UUID) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                rp.id, rp.full_name, rp.designation,
                rp.email, rp.mobile_number, rp.professional_profile_url
            FROM person_expertise pe
            JOIN resource_persons rp ON pe.resource_person_id = rp.id
            WHERE pe.expertise_id = %s AND rp.approval_status = 'APPROVED'
            ORDER BY rp.full_name ASC;
        """
        return self.execute_query(query, (str(exp_id),))

