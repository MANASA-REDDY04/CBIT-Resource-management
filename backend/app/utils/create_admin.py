import argparse
import sys
from app.core.database import get_db_connection
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository


def main():
    parser = argparse.ArgumentParser(description="Create or update an Admin user for CBIT Resource Hub")
    parser.add_argument("--name", default="CBIT System Administrator", help="Full name of administrator")
    parser.add_argument("--email", default="admin@cbit.ac.in", help="Admin email address")
    parser.add_argument("--password", default="Admin@Cbit2025!", help="Plain text password to securely hash")
    parser.add_argument("--employee-id", default="CBIT-ADM-001", help="Employee ID")
    parser.add_argument("--role", default="ADMIN", choices=["ADMIN", "AUTHORISED_FACULTY", "GENERAL_STAFF"])

    args = parser.parse_args()

    print(f"[*] Hashing password for '{args.email}'...")
    pwd_hash = hash_password(args.password)
    print(f"[+] Secure bcrypt hash generated: {pwd_hash}")

    try:
        with get_db_connection() as conn:
            user_repo = UserRepository(conn)
            existing = user_repo.get_by_email(args.email)
            if existing:
                print(f"[*] User {args.email} already exists. Updating credentials and elevating role...")
                user_repo.update_user(
                    user_id=existing["id"],
                    full_name=args.name,
                    role=args.role,
                    can_create_records=True,
                    can_edit_records=True,
                    password_hash=pwd_hash,
                    is_active=True
                )
                print(f"[✓] User {args.email} successfully updated!")
            else:
                user_repo.create_user(
                    full_name=args.name,
                    email=args.email,
                    password_hash=pwd_hash,
                    role=args.role,
                    employee_id=args.employee_id,
                    can_create_records=True,
                    can_edit_records=True,
                    is_active=True
                )
                print(f"[✓] Admin user {args.email} created successfully!")
    except Exception as e:
        print(f"[!] Database connection error: {e}")
        print("Note: Ensure PostgreSQL is running and DATABASE_URL is configured.")
        sys.exit(1)


if __name__ == "__main__":
    main()

