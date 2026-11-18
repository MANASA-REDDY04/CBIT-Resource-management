import json
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
import psycopg
from app.repositories.base import BaseRepository


class ResourcePersonRepository(BaseRepository):
    def search_resource_persons(
        self,
        limit: int = 10,
        offset: int = 0,
        q: Optional[str] = None,                    # Global search across name, designation, email, org, expertise
        full_name: Optional[str] = None,
        organisation: Optional[str] = None,
        expertise: Optional[str] = None,
        designation: Optional[str] = None,
        address: Optional[str] = None,
        email: Optional[str] = None,
        mobile: Optional[str] = None,
        approval_status: Optional[str] = "APPROVED", # Defaults to APPROVED for general directory
        created_by: Optional[UUID] = None,           # For faculty viewing their own submissions
        sort_by: str = "created_at",
        sort_order: str = "DESC"
    ) -> List[Dict[str, Any]]:
        conditions = ["1=1"]
        params: List[Any] = []

        if approval_status:
            conditions.append("rp.approval_status = %s")
            params.append(approval_status)

        if created_by:
            conditions.append("rp.created_by = %s")
            params.append(str(created_by))

        if q and q.strip():
            pattern = f"%{q.strip()}%"
            conditions.append("""(
                rp.full_name ILIKE %s OR 
                rp.designation ILIKE %s OR 
                rp.email ILIKE %s OR 
                rp.address ILIKE %s OR
                EXISTS (
                    SELECT 1 FROM person_organisations po2
                    JOIN organisations o2 ON po2.organisation_id = o2.id
                    WHERE po2.resource_person_id = rp.id AND o2.organisation_name ILIKE %s
                ) OR
                EXISTS (
                    SELECT 1 FROM person_expertise pe2
                    JOIN expertise e2 ON pe2.expertise_id = e2.id
                    WHERE pe2.resource_person_id = rp.id AND e2.expertise_name ILIKE %s
                )
            )""")
            params.extend([pattern, pattern, pattern, pattern, pattern, pattern])

        if full_name and full_name.strip():
            conditions.append("rp.full_name ILIKE %s")
            params.append(f"%{full_name.strip()}%")

        if designation and designation.strip():
            conditions.append("rp.designation ILIKE %s")
            params.append(f"%{designation.strip()}%")

        if email and email.strip():
            conditions.append("rp.email ILIKE %s")
            params.append(f"%{email.strip()}%")

        if mobile and mobile.strip():
            conditions.append("rp.mobile_number ILIKE %s")
            params.append(f"%{mobile.strip()}%")

        if address and address.strip():
            conditions.append("rp.address ILIKE %s")
            params.append(f"%{address.strip()}%")

        if organisation and organisation.strip():
            conditions.append("""
                EXISTS (
                    SELECT 1 FROM person_organisations po_filter
                    JOIN organisations o_filter ON po_filter.organisation_id = o_filter.id
                    WHERE po_filter.resource_person_id = rp.id 
                      AND o_filter.organisation_name ILIKE %s
                )
            """)
            params.append(f"%{organisation.strip()}%")

        if expertise and expertise.strip():
            conditions.append("""
                EXISTS (
                    SELECT 1 FROM person_expertise pe_filter
                    JOIN expertise e_filter ON pe_filter.expertise_id = e_filter.id
                    WHERE pe_filter.resource_person_id = rp.id 
                      AND e_filter.expertise_name ILIKE %s
                )
            """)
            params.append(f"%{expertise.strip()}%")

        # Sanitize sort column and order
        allowed_sorts = {
            "full_name": "rp.full_name",
            "designation": "rp.designation",
            "created_at": "rp.created_at",
            "updated_at": "rp.updated_at"
        }
        order_col = allowed_sorts.get(sort_by, "rp.created_at")
        order_dir = "ASC" if sort_order.upper() == "ASC" else "DESC"

        params.extend([limit, offset])

        query = f"""
            SELECT 
                rp.id, rp.full_name, rp.designation, rp.email, rp.mobile_number,
                rp.address, rp.professional_biography, rp.professional_profile_url,
                rp.approval_status, rp.rejection_reason, rp.created_by, rp.reviewed_by,
                rp.reviewed_at, rp.created_at, rp.updated_at,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', po.id,
                                'organisation_id', o.id,
                                'organisation_name', o.organisation_name,
                                'organisation_type', o.organisation_type,
                                'website', o.website,
                                'designation', po.designation,
                                'start_date', po.start_date,
                                'end_date', po.end_date,
                                'is_current', po.is_current
                            ) ORDER BY po.is_current DESC, po.start_date DESC NULLS LAST
                        )
                        FROM person_organisations po
                        JOIN organisations o ON po.organisation_id = o.id
                        WHERE po.resource_person_id = rp.id
                    ), '[]'::json
                ) AS organisations,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', e.id,
                                'expertise_name', e.expertise_name,
                                'category', e.category
                            ) ORDER BY e.category ASC, e.expertise_name ASC
                        )
                        FROM person_expertise pe
                        JOIN expertise e ON pe.expertise_id = e.id
                        WHERE pe.resource_person_id = rp.id
                    ), '[]'::json
                ) AS expertise
            FROM resource_persons rp
            WHERE {' AND '.join(conditions)}
            ORDER BY {order_col} {order_dir}
            LIMIT %s OFFSET %s;
        """
        return self.execute_query(query, tuple(params))

    def count_search_resource_persons(
        self,
        q: Optional[str] = None,
        full_name: Optional[str] = None,
        organisation: Optional[str] = None,
        expertise: Optional[str] = None,
        designation: Optional[str] = None,
        address: Optional[str] = None,
        email: Optional[str] = None,
        mobile: Optional[str] = None,
        approval_status: Optional[str] = "APPROVED",
        created_by: Optional[UUID] = None
    ) -> int:
        conditions = ["1=1"]
        params: List[Any] = []

        if approval_status:
            conditions.append("rp.approval_status = %s")
            params.append(approval_status)

        if created_by:
            conditions.append("rp.created_by = %s")
            params.append(str(created_by))

        if q and q.strip():
            pattern = f"%{q.strip()}%"
            conditions.append("""(
                rp.full_name ILIKE %s OR 
                rp.designation ILIKE %s OR 
                rp.email ILIKE %s OR 
                rp.address ILIKE %s OR
                EXISTS (
                    SELECT 1 FROM person_organisations po2
                    JOIN organisations o2 ON po2.organisation_id = o2.id
                    WHERE po2.resource_person_id = rp.id AND o2.organisation_name ILIKE %s
                ) OR
                EXISTS (
                    SELECT 1 FROM person_expertise pe2
                    JOIN expertise e2 ON pe2.expertise_id = e2.id
                    WHERE pe2.resource_person_id = rp.id AND e2.expertise_name ILIKE %s
                )
            )""")
            params.extend([pattern, pattern, pattern, pattern, pattern, pattern])

        if full_name and full_name.strip():
            conditions.append("rp.full_name ILIKE %s")
            params.append(f"%{full_name.strip()}%")

        if designation and designation.strip():
            conditions.append("rp.designation ILIKE %s")
            params.append(f"%{designation.strip()}%")

        if email and email.strip():
            conditions.append("rp.email ILIKE %s")
            params.append(f"%{email.strip()}%")

        if mobile and mobile.strip():
            conditions.append("rp.mobile_number ILIKE %s")
            params.append(f"%{mobile.strip()}%")

        if address and address.strip():
            conditions.append("rp.address ILIKE %s")
            params.append(f"%{address.strip()}%")

        if organisation and organisation.strip():
            conditions.append("""
                EXISTS (
                    SELECT 1 FROM person_organisations po_filter
                    JOIN organisations o_filter ON po_filter.organisation_id = o_filter.id
                    WHERE po_filter.resource_person_id = rp.id 
                      AND o_filter.organisation_name ILIKE %s
                )
            """)
            params.append(f"%{organisation.strip()}%")

        if expertise and expertise.strip():
            conditions.append("""
                EXISTS (
                    SELECT 1 FROM person_expertise pe_filter
                    JOIN expertise e_filter ON pe_filter.expertise_id = e_filter.id
                    WHERE pe_filter.resource_person_id = rp.id 
                      AND e_filter.expertise_name ILIKE %s
                )
            """)
            params.append(f"%{expertise.strip()}%")

        query = f"""
            SELECT COUNT(*) AS total
            FROM resource_persons rp
            WHERE {' AND '.join(conditions)};
        """
        res = self.execute_one(query, tuple(params))
        return res["total"] if res else 0

    def get_by_id(self, rp_id: UUID) -> Optional[Dict[str, Any]]:
        query = """
            SELECT 
                rp.id, rp.full_name, rp.designation, rp.email, rp.mobile_number,
                rp.address, rp.professional_biography, rp.professional_profile_url,
                rp.approval_status, rp.rejection_reason, rp.created_by, rp.reviewed_by,
                rp.reviewed_at, rp.created_at, rp.updated_at,
                u_creator.full_name AS creator_name,
                u_reviewer.full_name AS reviewer_name,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', po.id,
                                'organisation_id', o.id,
                                'organisation_name', o.organisation_name,
                                'organisation_type', o.organisation_type,
                                'website', o.website,
                                'designation', po.designation,
                                'start_date', po.start_date,
                                'end_date', po.end_date,
                                'is_current', po.is_current
                            ) ORDER BY po.is_current DESC, po.start_date DESC NULLS LAST
                        )
                        FROM person_organisations po
                        JOIN organisations o ON po.organisation_id = o.id
                        WHERE po.resource_person_id = rp.id
                    ), '[]'::json
                ) AS organisations,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', e.id,
                                'expertise_name', e.expertise_name,
                                'category', e.category
                            ) ORDER BY e.category ASC, e.expertise_name ASC
                        )
                        FROM person_expertise pe
                        JOIN expertise e ON pe.expertise_id = e.id
                        WHERE pe.resource_person_id = rp.id
                    ), '[]'::json
                ) AS expertise,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', ah.id,
                                'action', ah.action,
                                'previous_status', ah.previous_status,
                                'new_status', ah.new_status,
                                'reviewed_by', ah.reviewed_by,
                                'reviewer_name', u_ah.full_name,
                                'comments', ah.comments,
                                'created_at', ah.created_at
                            ) ORDER BY ah.created_at DESC
                        )
                        FROM approval_history ah
                        LEFT JOIN users u_ah ON ah.reviewed_by = u_ah.id
                        WHERE ah.resource_person_id = rp.id
                    ), '[]'::json
                ) AS approval_history
            FROM resource_persons rp
            LEFT JOIN users u_creator ON rp.created_by = u_creator.id
            LEFT JOIN users u_reviewer ON rp.reviewed_by = u_reviewer.id
            WHERE rp.id = %s;
        """
        return self.execute_one(query, (str(rp_id),))

    def create_resource_person(
        self,
        full_name: str,
        designation: str,
        email: str,
        mobile_number: str,
        address: Optional[str] = None,
        professional_biography: Optional[str] = None,
        professional_profile_url: Optional[str] = None,
        created_by: Optional[UUID] = None,
        approval_status: str = "PENDING",
        organisations: Optional[List[Dict[str, Any]]] = None,
        expertise_ids: Optional[List[UUID]] = None
    ) -> Dict[str, Any]:
        """
        Inserts resource person and their associations within an atomic transaction.
        """
        with self.conn.cursor() as cur:
            # 1. Insert Core Profile
            insert_rp_q = """
                INSERT INTO resource_persons (
                    full_name, designation, email, mobile_number,
                    address, professional_biography, professional_profile_url,
                    approval_status, created_by
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, full_name, designation, email, mobile_number,
                          approval_status, created_at, updated_at;
            """
            cur.execute(
                insert_rp_q,
                (
                    full_name.strip(),
                    designation.strip(),
                    email.strip().lower(),
                    mobile_number.strip(),
                    address.strip() if address else None,
                    professional_biography.strip() if professional_biography else None,
                    professional_profile_url.strip() if professional_profile_url else None,
                    approval_status,
                    str(created_by) if created_by else None
                )
            )
            rp = cur.fetchone()
            rp_id = rp["id"]

            # 2. Insert Organisations
            if organisations:
                insert_org_q = """
                    INSERT INTO person_organisations (
                        resource_person_id, organisation_id, designation,
                        start_date, end_date, is_current
                    )
                    VALUES (%s, %s, %s, %s, %s, %s);
                """
                for org in organisations:
                    cur.execute(
                        insert_org_q,
                        (
                            str(rp_id),
                            str(org["organisation_id"]),
                            org["designation"].strip(),
                            org.get("start_date"),
                            org.get("end_date"),
                            org.get("is_current", True)
                        )
                    )

            # 3. Insert Expertise
            if expertise_ids:
                insert_exp_q = """
                    INSERT INTO person_expertise (resource_person_id, expertise_id)
                    VALUES (%s, %s)
                    ON CONFLICT (resource_person_id, expertise_id) DO NOTHING;
                """
                for exp_id in expertise_ids:
                    cur.execute(insert_exp_q, (str(rp_id), str(exp_id)))

            # 4. Insert initial Approval History entry
            history_q = """
                INSERT INTO approval_history (
                    resource_person_id, action, previous_status, new_status, reviewed_by, comments
                )
                VALUES (%s, 'SUBMITTED', NULL, %s, %s, 'Initial profile submission');
            """
            cur.execute(history_q, (str(rp_id), approval_status, str(created_by) if created_by else None))

        # Return full created entity
        return self.get_by_id(rp_id)

    def update_resource_person(
        self,
        rp_id: UUID,
        full_name: Optional[str] = None,
        designation: Optional[str] = None,
        email: Optional[str] = None,
        mobile_number: Optional[str] = None,
        address: Optional[str] = None,
        professional_biography: Optional[str] = None,
        professional_profile_url: Optional[str] = None,
        organisations: Optional[List[Dict[str, Any]]] = None,
        expertise_ids: Optional[List[UUID]] = None,
        updated_by: Optional[UUID] = None
    ) -> Optional[Dict[str, Any]]:
        with self.conn.cursor() as cur:
            fields = ["updated_at = CURRENT_TIMESTAMP"]
            params: List[Any] = []

            if full_name is not None:
                fields.append("full_name = %s")
                params.append(full_name.strip())

            if designation is not None:
                fields.append("designation = %s")
                params.append(designation.strip())

            if email is not None:
                fields.append("email = %s")
                params.append(email.strip().lower())

            if mobile_number is not None:
                fields.append("mobile_number = %s")
                params.append(mobile_number.strip())

            if address is not None:
                fields.append("address = %s")
                params.append(address.strip() if address else None)

            if professional_biography is not None:
                fields.append("professional_biography = %s")
                params.append(professional_biography.strip() if professional_biography else None)

            if professional_profile_url is not None:
                fields.append("professional_profile_url = %s")
                params.append(professional_profile_url.strip() if professional_profile_url else None)

            params.append(str(rp_id))

            update_q = f"UPDATE resource_persons SET {', '.join(fields)} WHERE id = %s;"
            cur.execute(update_q, tuple(params))

            # Update organisations if provided
            if organisations is not None:
                cur.execute("DELETE FROM person_organisations WHERE resource_person_id = %s;", (str(rp_id),))
                insert_org_q = """
                    INSERT INTO person_organisations (
                        resource_person_id, organisation_id, designation,
                        start_date, end_date, is_current
                    )
                    VALUES (%s, %s, %s, %s, %s, %s);
                """
                for org in organisations:
                    cur.execute(
                        insert_org_q,
                        (
                            str(rp_id),
                            str(org["organisation_id"]),
                            org["designation"].strip(),
                            org.get("start_date"),
                            org.get("end_date"),
                            org.get("is_current", True)
                        )
                    )

            # Update expertise if provided
            if expertise_ids is not None:
                cur.execute("DELETE FROM person_expertise WHERE resource_person_id = %s;", (str(rp_id),))
                insert_exp_q = """
                    INSERT INTO person_expertise (resource_person_id, expertise_id)
                    VALUES (%s, %s)
                    ON CONFLICT (resource_person_id, expertise_id) DO NOTHING;
                """
                for exp_id in expertise_ids:
                    cur.execute(insert_exp_q, (str(rp_id), str(exp_id)))

            # Log to approval history as an update
            history_q = """
                INSERT INTO approval_history (
                    resource_person_id, action, previous_status, new_status, reviewed_by, comments
                )
                VALUES (%s, 'UPDATED', (SELECT approval_status FROM resource_persons WHERE id = %s), (SELECT approval_status FROM resource_persons WHERE id = %s), %s, 'Profile details updated');
            """
            cur.execute(history_q, (str(rp_id), str(rp_id), str(rp_id), str(updated_by) if updated_by else None))

        return self.get_by_id(rp_id)

    def delete_resource_person(self, rp_id: UUID) -> bool:
        query = "DELETE FROM resource_persons WHERE id = %s;"
        self.execute_commit(query, (str(rp_id),))
        return True

    def get_organisations_for_person(self, rp_id: UUID) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                po.id, po.organisation_id, o.organisation_name, o.organisation_type,
                o.website, po.designation, po.start_date, po.end_date, po.is_current
            FROM person_organisations po
            JOIN organisations o ON po.organisation_id = o.id
            WHERE po.resource_person_id = %s
            ORDER BY po.is_current DESC, po.start_date DESC NULLS LAST;
        """
        return self.execute_query(query, (str(rp_id),))

    def get_expertise_for_person(self, rp_id: UUID) -> List[Dict[str, Any]]:
        query = """
            SELECT e.id, e.expertise_name, e.category, e.description
            FROM person_expertise pe
            JOIN expertise e ON pe.expertise_id = e.id
            WHERE pe.resource_person_id = %s
            ORDER BY e.category ASC, e.expertise_name ASC;
        """
        return self.execute_query(query, (str(rp_id),))

