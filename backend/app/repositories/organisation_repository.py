from typing import Any, Dict, List, Optional
from uuid import UUID
from app.repositories.base import BaseRepository


class OrganisationRepository(BaseRepository):
    def list_organisations(
        self,
        limit: int = 50,
        offset: int = 0,
        search: Optional[str] = None,
        org_type: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        conditions = ["1=1"]
        params: List[Any] = []

        if search:
            conditions.append("(o.organisation_name ILIKE %s OR o.address ILIKE %s)")
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern])

        if org_type:
            conditions.append("o.organisation_type = %s")
            params.append(org_type)

        if is_active is not None:
            conditions.append("o.is_active = %s")
            params.append(is_active)

        params.extend([limit, offset])

        query = f"""
            SELECT 
                o.id, o.organisation_name, o.organisation_type, o.website,
                o.address, o.description, o.is_active, o.created_at, o.updated_at,
                COUNT(DISTINCT CASE WHEN rp.approval_status = 'APPROVED' THEN po.resource_person_id END) AS resource_person_count
            FROM organisations o
            LEFT JOIN person_organisations po ON o.id = po.organisation_id
            LEFT JOIN resource_persons rp ON po.resource_person_id = rp.id
            WHERE {' AND '.join(conditions)}
            GROUP BY o.id
            ORDER BY o.organisation_name ASC
            LIMIT %s OFFSET %s;
        """
        return self.execute_query(query, tuple(params))

    def count_organisations(
        self,
        search: Optional[str] = None,
        org_type: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> int:
        conditions = ["1=1"]
        params: List[Any] = []

        if search:
            conditions.append("(o.organisation_name ILIKE %s OR o.address ILIKE %s)")
            pattern = f"%{search.strip()}%"
            params.extend([pattern, pattern])

        if org_type:
            conditions.append("o.organisation_type = %s")
            params.append(org_type)

        if is_active is not None:
            conditions.append("o.is_active = %s")
            params.append(is_active)

        query = f"""
            SELECT COUNT(*) AS total
            FROM organisations o
            WHERE {' AND '.join(conditions)};
        """
        res = self.execute_one(query, tuple(params))
        return res["total"] if res else 0

    def get_by_id(self, org_id: UUID) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                o.id, o.organisation_name, o.organisation_type, o.website,
                o.address, o.description, o.is_active, o.created_at, o.updated_at,
                COUNT(DISTINCT CASE WHEN rp.approval_status = 'APPROVED' THEN po.resource_person_id END) AS resource_person_count
            FROM organisations o
            LEFT JOIN person_organisations po ON o.id = po.organisation_id
            LEFT JOIN resource_persons rp ON po.resource_person_id = rp.id
            WHERE o.id = %s
            GROUP BY o.id;
        """
        return self.execute_one(query, (str(org_id),))

    def get_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT id, organisation_name, organisation_type, website, address, description, is_active
            FROM organisations
            WHERE LOWER(organisation_name) = LOWER(%s);
        """
        return self.execute_one(query, (name.strip(),))

    def create(
        self,
        name: str,
        org_type: str = "Corporate",
        website: Optional[str] = None,
        address: Optional[str] = None,
        description: Optional[str] = None,
        is_active: bool = True
    ) -> Dict[str, Any]:
        query = """
            INSERT INTO organisations (organisation_name, organisation_type, website, address, description, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, organisation_name, organisation_type, website, address, description, is_active, created_at, updated_at;
        """
        return self.execute_one(query, (name.strip(), org_type.strip(), website, address, description, is_active))

    def update(
        self,
        org_id: UUID,
        name: Optional[str] = None,
        org_type: Optional[str] = None,
        website: Optional[str] = None,
        address: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> Optional[Dict[str, Any]]:
        fields = ["updated_at = CURRENT_TIMESTAMP"]
        params = []

        if name is not None:
            fields.append("organisation_name = %s")
            params.append(name.strip())

        if org_type is not None:
            fields.append("organisation_type = %s")
            params.append(org_type.strip())

        if website is not None:
            fields.append("website = %s")
            params.append(website.strip() if website else None)

        if address is not None:
            fields.append("address = %s")
            params.append(address.strip() if address else None)

        if description is not None:
            fields.append("description = %s")
            params.append(description)

        if is_active is not None:
            fields.append("is_active = %s")
            params.append(is_active)

        params.append(str(org_id))

        query = f"""
            UPDATE organisations
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING id, organisation_name, organisation_type, website, address, description, is_active, created_at, updated_at;
        """
        return self.execute_one(query, tuple(params))

    def delete(self, org_id: UUID) -> bool:
        # Check if associations exist
        check_q = "SELECT COUNT(*) AS count FROM person_organisations WHERE organisation_id = %s;"
        res = self.execute_one(check_q, (str(org_id),))
        if res and res["count"] > 0:
            return False
        query = "DELETE FROM organisations WHERE id = %s;"
        self.execute_commit(query, (str(org_id),))
        return True

    def get_associated_resource_persons(self, org_id: UUID) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                rp.id, rp.full_name, rp.designation AS primary_designation,
                rp.email, rp.mobile_number, rp.professional_profile_url,
                po.designation AS organisation_designation,
                po.start_date, po.end_date, po.is_current
            FROM person_organisations po
            JOIN resource_persons rp ON po.resource_person_id = rp.id
            WHERE po.organisation_id = %s AND rp.approval_status = 'APPROVED'
            ORDER BY po.is_current DESC, po.start_date DESC NULLS LAST, rp.full_name ASC;
        """
        return self.execute_query(query, (str(org_id),))

