import logging
from typing import Any, Dict, List, Optional
import psycopg

logger = logging.getLogger(__name__)


class BaseRepository:
    def __init__(self, connection: psycopg.Connection):
        self.conn = connection

    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        with self.conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()

    def execute_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        with self.conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchone()

    def execute_commit(self, query: str, params: tuple = ()) -> None:
        with self.conn.cursor() as cur:
            cur.execute(query, params)

