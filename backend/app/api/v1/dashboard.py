from typing import Any
from fastapi import APIRouter, Depends
import psycopg

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import DashboardActivityResponse, DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: Any = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve system statistics from PostgreSQL."""
    dashboard_repo = DashboardRepository(conn)
    return dashboard_repo.get_stats()


@router.get("/recent-activity", response_model=DashboardActivityResponse)
def get_dashboard_recent_activity(
    current_user: Any = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db)
) -> Any:
    """Retrieve recent submissions, approved profiles, and pending queue."""
    dashboard_repo = DashboardRepository(conn)
    return dashboard_repo.get_recent_activity()

