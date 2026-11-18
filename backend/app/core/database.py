import logging
from contextlib import contextmanager
from typing import Generator
import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global connection pool instance
_pool: ConnectionPool | None = None


def get_connection_pool() -> ConnectionPool:
    """Retrieve the global connection pool or initialize it if necessary."""
    global _pool
    if _pool is None or _pool.closed:
        logger.info("Initializing Psycopg 3 ConnectionPool...")
        # Normalizing database url for psycopg3 if necessary
        db_url = settings.DATABASE_URL
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)

        _pool = ConnectionPool(
            conninfo=db_url,
            min_size=settings.DB_POOL_MIN_SIZE,
            max_size=settings.DB_POOL_MAX_SIZE,
            timeout=settings.DB_POOL_TIMEOUT,
            kwargs={
                "autocommit": False,
                "row_factory": dict_row
            },
            open=True
        )
        logger.info("Psycopg 3 ConnectionPool successfully initialized.")
    return _pool


def close_connection_pool() -> None:
    """Gracefully close the Psycopg 3 connection pool on application shutdown."""
    global _pool
    if _pool and not _pool.closed:
        logger.info("Closing Psycopg 3 ConnectionPool...")
        _pool.close()
        _pool = None
        logger.info("Connection pool closed.")


@contextmanager
def get_db_connection() -> Generator[psycopg.Connection, None, None]:
    """
    Context manager yielding a database connection from the pool.
    Commits on successful completion, rolls back on uncaught exceptions.
    """
    pool = get_connection_pool()
    with pool.connection() as conn:
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise


def get_db() -> Generator[psycopg.Connection, None, None]:
    """
    FastAPI dependency that provides a connection from the pool per request.
    Automatically manages commits and rollbacks.
    """
    with get_db_connection() as conn:
        yield conn


def check_database_health() -> bool:
    """Check connectivity to PostgreSQL database."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1 AS alive;")
                row = cursor.fetchone()
                return bool(row and row.get("alive") == 1)
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

