from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_resource_persons: int
    approved_resource_persons: int
    pending_approvals: int
    rejected_resource_persons: int
    total_organisations: int
    total_expertise_areas: int
    total_registered_staff: int


class RecentActivityItem(BaseModel):
    id: UUID
    full_name: str
    designation: str
    organisation_names: List[str] = []
    approval_status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None


class DashboardActivityResponse(BaseModel):
    recently_added: List[RecentActivityItem]
    recently_approved: List[RecentActivityItem]
    pending_summary: List[RecentActivityItem]

