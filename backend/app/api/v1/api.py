from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.departments import router as departments_router
from app.api.v1.expertise import router as expertise_router
from app.api.v1.organisations import router as organisations_router
from app.api.v1.resource_persons import router as resource_persons_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(resource_persons_router)
api_router.include_router(organisations_router)
api_router.include_router(expertise_router)
api_router.include_router(departments_router)
api_router.include_router(admin_router)

