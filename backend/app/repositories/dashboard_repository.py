from typing import Any, Dict, List
from app.repositories.base import BaseRepository


class DashboardRepository(BaseRepository):
    def get_stats(self) -> Dict[str, int]:
        query = """
            SELECT
                (SELECT COUNT(*) FROM resource_persons) AS total_resource_persons,
                (SELECT COUNT(*) FROM resource_persons WHERE approval_status = 'APPROVED') AS approved_resource_persons,
                (SELECT COUNT(*) FROM resource_persons WHERE approval_status = 'PENDING') AS pending_approvals,
                (SELECT COUNT(*) FROM resource_persons WHERE approval_status = 'REJECTED') AS rejected_resource_persons,
                (SELECT COUNT(*) FROM organisations WHERE is_active = TRUE) AS total_organisations,
                (SELECT COUNT(*) FROM expertise WHERE is_active = TRUE) AS total_expertise_areas,
                (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS total_registered_staff;
        """
        row = self.execute_one(query)
        if not row:
            return {
                "total_resource_persons": 0,
                "approved_resource_persons": 0,
                "pending_approvals": 0,
                "rejected_resource_persons": 0,
                "total_organisations": 0,
                "total_expertise_areas": 0,
                "total_registered_staff": 0
            }
        return {
            "total_resource_persons": row["total_resource_persons"],
            "approved_resource_persons": row["approved_resource_persons"],
            "pending_approvals": row["pending_approvals"],
            "rejected_resource_persons": row["rejected_resource_persons"],
            "total_organisations": row["total_organisations"],
            "total_expertise_areas": row["total_expertise_areas"],
            "total_registered_staff": row["total_registered_staff"]
        }

    def get_recent_activity(self) -> Dict[str, List[Dict[str, Any]]]:
        # Recently added profiles (any status)
        recent_added_q = """
            SELECT 
                rp.id, rp.full_name, rp.designation, rp.approval_status, rp.created_at, rp.reviewed_at,
                ARRAY(
                    SELECT o.organisation_name 
                    FROM person_organisations po 
                    JOIN organisations o ON po.organisation_id = o.id 
                    WHERE po.resource_person_id = rp.id
                ) AS organisation_names
            FROM resource_persons rp
            ORDER BY rp.created_at DESC
            LIMIT 5;
        """
        recently_added = self.execute_query(recent_added_q)

        # Recently approved profiles
        recent_approved_q = """
            SELECT 
                rp.id, rp.full_name, rp.designation, rp.approval_status, rp.created_at, rp.reviewed_at,
                ARRAY(
                    SELECT o.organisation_name 
                    FROM person_organisations po 
                    JOIN organisations o ON po.organisation_id = o.id 
                    WHERE po.resource_person_id = rp.id
                ) AS organisation_names
            FROM resource_persons rp
            WHERE rp.approval_status = 'APPROVED'
            ORDER BY rp.reviewed_at DESC NULLS LAST, rp.updated_at DESC
            LIMIT 5;
        """
        recently_approved = self.execute_query(recent_approved_q)

        # Pending approvals summary
        pending_summary_q = """
            SELECT 
                rp.id, rp.full_name, rp.designation, rp.approval_status, rp.created_at, rp.reviewed_at,
                ARRAY(
                    SELECT o.organisation_name 
                    FROM person_organisations po 
                    JOIN organisations o ON po.organisation_id = o.id 
                    WHERE po.resource_person_id = rp.id
                ) AS organisation_names
            FROM resource_persons rp
            WHERE rp.approval_status = 'PENDING'
            ORDER BY rp.created_at ASC
            LIMIT 5;
        """
        pending_summary = self.execute_query(pending_summary_q)

        return {
            "recently_added": recently_added,
            "recently_approved": recently_approved,
            "pending_summary": pending_summary
        }

