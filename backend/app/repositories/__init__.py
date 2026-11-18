# Repositories package initialization
from app.repositories.base import BaseRepository
from app.repositories.user_repository import UserRepository
from app.repositories.department_repository import DepartmentRepository
from app.repositories.organisation_repository import OrganisationRepository
from app.repositories.expertise_repository import ExpertiseRepository
from app.repositories.resource_person_repository import ResourcePersonRepository
from app.repositories.approval_repository import ApprovalRepository
from app.repositories.dashboard_repository import DashboardRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "DepartmentRepository",
    "OrganisationRepository",
    "ExpertiseRepository",
    "ResourcePersonRepository",
    "ApprovalRepository",
    "DashboardRepository",
]

