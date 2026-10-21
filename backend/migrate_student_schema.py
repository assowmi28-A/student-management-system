"""Add missing nullable student columns after backing up the database."""
import argparse

from app.database import engine
from app.migrations import add_missing_student_columns


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--backup-confirmed",
        action="store_true",
        help="confirm that a verified database backup exists",
    )
    args = parser.parse_args()
    if not args.backup_confirmed:
        parser.error("create and verify a database backup before migrating")

    added_columns = add_missing_student_columns(engine)
    if added_columns:
        print("Added nullable student columns: " + ", ".join(added_columns))
    else:
        print("No student schema changes were needed.")


if __name__ == "__main__":
    main()
