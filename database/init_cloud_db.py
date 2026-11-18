"""
CBIT Resource Hub - Cloud Database Initializer
Executes schema.sql, seed.sql, and admin_setup.sql against your cloud PostgreSQL instance.
"""

import os
import sys
from pathlib import Path

# External connection URL provided for Render PostgreSQL
DEFAULT_DB_URL = (
    "postgresql://cbit_admin:tYCfXKmTyElLxk4DcVSU6RmnxKNbA29i"
    "@dpg-dbrue28n74is738b8l10-a.singapore-postgres.render.com/cbit_resource_hub"
    "?sslmode=require"
)

def run():
    db_url = os.environ.get("DATABASE_URL", DEFAULT_DB_URL)
    if "sslmode" not in db_url and "render.com" in db_url:
        db_url += ("&" if "?" in db_url else "?") + "sslmode=require"

    print("=" * 70)
    print("CBIT RESOURCE HUB - CLOUD POSTGRESQL INITIALIZATION")
    print("Chaitanya Bharathi Institute of Technology, Hyderabad")
    print("=" * 70)
    print(f"[*] Target Host: dpg-dbrue28n74is738b8l10-a.singapore-postgres.render.com")
    print(f"[*] Database: cbit_resource_hub")
    print(f"[*] User: cbit_admin")
    print("-" * 70)

    try:
        import psycopg
    except ImportError:
        print("[!] 'psycopg' library is required. Install it using:")
        print("    pip install \"psycopg[binary]\"")
        sys.exit(1)

    base_dir = Path(__file__).resolve().parent
    scripts = [
        ("1. Schema & Constraints", base_dir / "schema.sql"),
        ("2. Master Seed Data", base_dir / "seed.sql"),
        ("3. Admin & Staff Roles Setup", base_dir / "admin_setup.sql"),
    ]

    try:
        print("[*] Connecting to Render PostgreSQL instance...")
        with psycopg.connect(db_url, autocommit=True) as conn:
            print("[+] Successfully connected to cloud PostgreSQL!")
            print("-" * 70)

            for title, script_path in scripts:
                if not script_path.exists():
                    print(f"[!] Error: File not found: {script_path}")
                    sys.exit(1)

                print(f"[*] Executing {title} ({script_path.name})...")
                sql_content = script_path.read_text(encoding="utf-8")

                with conn.cursor() as cur:
                    cur.execute(sql_content)

                print(f"[✓] {title} executed successfully!")

            # Verification Query
            print("-" * 70)
            print("[*] Verifying created database tables...")
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                """)
                tables = [row[0] for row in cur.fetchall()]

                print(f"[+] Found {len(tables)} tables in database:")
                for t in tables:
                    print(f"    - {t}")

                # Verify seed users
                cur.execute("SELECT full_name, email, role, is_active FROM users ORDER BY role;")
                users = cur.fetchall()
                print(f"\n[+] Seeded Staff & Admin Accounts ({len(users)}):")
                for u in users:
                    print(f"    - {u[0]} ({u[1]}) | Role: {u[2]} | Active: {u[3]}")

        print("=" * 70)
        print("[🎉] Cloud Database initialization completed successfully!")
        print("=" * 70)

    except Exception as e:
        print(f"\n[!] Database execution failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    run()

