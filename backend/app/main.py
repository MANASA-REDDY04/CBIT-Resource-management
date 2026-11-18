from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import check_database_health, close_connection_pool, get_connection_pool

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cbit_resource_hub")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Psycopg 3 connection pool
    logger.info("Starting CBIT Resource Hub Backend...")
    try:
        pool = get_connection_pool()
        logger.info(f"Database pool ready: {pool}")
    except Exception as e:
        logger.warning(f"Could not connect to database on startup ({e}). Ensure database is online.")
    
    yield

    # Shutdown: Close Psycopg 3 connection pool
    logger.info("Shutting down CBIT Resource Hub Backend...")
    close_connection_pool()


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Centralized Institutional Resource Person Management Platform for "
        "Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
# In production, Render backend and frontend will be on different subdomains or custom domains.
# allow_credentials=True is required for HTTP-only cookie exchange and authorization headers.
origins = list(settings.BACKEND_CORS_ORIGINS)
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://localhost(:\d+)?|https?://127\.0\.0\.1(:\d+)?|https://.*\.onrender\.com|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "institution": "Chaitanya Bharathi Institute of Technology (CBIT)",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    db_alive = check_database_health()
    return {
        "status": "healthy" if db_alive else "degraded",
        "database_connected": db_alive,
        "environment": settings.APP_ENV,
        "app": settings.APP_NAME
    }


# Include v1 REST API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact support."}
    )

