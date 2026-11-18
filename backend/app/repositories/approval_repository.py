from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from app.repositories.base import BaseRepository


class ApprovalRepository(BaseRepository):
    def get_by_status(self, status: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                rp.id, rp.full_name, rp.designation, rp.email, rp.mobile_number,
                rp.approval_status, rp.rejection_reason, rp.created_by, rp.reviewed_by,
                rp.reviewed_at, rp.created_at, rp.updated_at,
                u_creator.full_name AS creator_name,
                u_creator.email AS creator_email,
                u_reviewer.full_name AS reviewer_name,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', po.id,
                                'organisation_id', o.id,
                                'organisation_name', o.organisation_name,
                                'designation', po.designation,
                                'is_current', po.is_current
                            )
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
                            )
                        )
                        FROM person_expertise pe
                        JOIN expertise e ON pe.expertise_id = e.id
                        WHERE pe.resource_person_id = rp.id
                    ), '[]'::json
                ) AS expertise
            FROM resource_persons rp
            LEFT JOIN users u_creator ON rp.created_by = u_creator.id
            LEFT JOIN users u_reviewer ON rp.reviewed_by = u_reviewer.id
            WHERE rp.approval_status = %s
            ORDER BY rp.created_at DESC
            LIMIT %s OFFSET %s;
        """
        return self.execute_query(query, (status, limit, offset))

    def count_by_status(self, status: str) -> int:
        query = "SELECT COUNT(*) AS total FROM resource_persons WHERE approval_status = %s;"
        res = self.execute_one(query, (status,))
        return res["total"] if res else 0

    def approve_profile(
        self,
        rp_id: UUID,
        reviewer_id: UUID,
        comments: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        with self.conn.cursor() as cur:
            # 1. Fetch current status
            cur.execute("SELECT approval_status FROM resource_persons WHERE id = %s;", (str(rp_id),))
            row = cur.fetchone()
            if not row:
                return None
            prev_status = row["approval_status"]

            # 2. Update resource person
            update_q = """
                UPDATE resource_persons
                SET approval_status = 'APPROVED',
                    reviewed_by = %s,
                    reviewed_at = CURRENT_TIMESTAMP,
                    rejection_reason = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, full_name, approval_status, reviewed_at;
            """
            cur.execute(update_q, (str(reviewer_id), str(rp_id)))
            updated = cur.fetchone()

            # 3. Insert approval history
            history_q = """
                INSERT INTO approval_history (
                    resource_person_id, action, previous_status, new_status, reviewed_by, comments
                )
                VALUES (%s, 'APPROVED', %s, 'APPROVED', %s, %s);
            """
            cur.execute(history_q, (str(rp_id), prev_status, str(reviewer_id), comments or "Profile approved"))

        return updated

    def reject_profile(
        self,
        rp_id: UUID,
        reviewer_id: UUID,
        rejection_reason: str,
        comments: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        with self.conn.cursor() as cur:
            # 1. Fetch current status
            cur.execute("SELECT approval_status FROM resource_persons WHERE id = %s;", (str(rp_id),))
            row = cur.fetchone()
            if not row:
                return None
            prev_status = row["approval_status"]

            # 2. Update resource person
            update_q = """
                UPDATE resource_persons
                SET approval_status = 'REJECTED',
                    reviewed_by = %s,
                    reviewed_at = CURRENT_TIMESTAMP,
                    rejection_reason = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, full_name, approval_status, rejection_reason, reviewed_at;
            """
            cur.execute(update_q, (str(reviewer_id), rejection_reason.strip(), str(rp_id)))
            updated = cur.fetchone()

            # 3. Insert approval history
            history_q = """
                INSERT INTO approval_history (
                    resource_person_id, action, previous_status, new_status, reviewed_by, comments
                )
                VALUES (%s, 'REJECTED', %s, 'REJECTED', %s, %s);
            """
            cur.execute(
                history_q,
                (str(rp_id), prev_status, str(reviewer_id), comments or f"Rejected: {rejection_reason}")
            )

        return updated

