"""Safely copy student rows from a SQLite database into PostgreSQL."""
import argparse
import os

from sqlalchemy import MetaData, Table, create_engine, inspect, select, text

from app.config import DATABASE_URL
from app.database import Base, engine
from app.migrations import add_missing_student_columns
from app.models import Student


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--backup-confirmed",
        action="store_true",
        help="confirm that source and destination backups are complete",
    )
    args = parser.parse_args()
    if not args.backup_confirmed:
        parser.error(
            "create and verify backups of the source and destination databases first"
        )

    source_url = os.getenv("LEGACY_SQLITE_URL", "").strip()
    if not source_url.startswith("sqlite:"):
        raise RuntimeError("Set LEGACY_SQLITE_URL to the source SQLite database URL.")
    if not DATABASE_URL.startswith("postgresql+psycopg://"):
        raise RuntimeError("DATABASE_URL must point to the PostgreSQL destination.")

    source_engine = create_engine(
        source_url,
        connect_args={"check_same_thread": False},
    )
    if "students" not in inspect(source_engine).get_table_names():
        raise RuntimeError("The source SQLite database has no students table.")

    Base.metadata.create_all(bind=engine)
    add_missing_student_columns(engine)

    source_table = Table(
        "students",
        MetaData(),
        autoload_with=source_engine,
    )
    source_columns = set(source_table.columns.keys())
    required_columns = {"id", "first_name", "last_name", "phone"}
    missing_columns = required_columns - source_columns
    if missing_columns:
        raise RuntimeError(
            "The source students table is missing required columns: "
            + ", ".join(sorted(missing_columns))
        )

    student_columns = [column.name for column in Student.__table__.columns]
    source_rows = []
    with source_engine.connect() as source_connection:
        for row in source_connection.execute(select(source_table)).mappings():
            source_rows.append(
                {
                    column: row[column] if column in source_columns else None
                    for column in student_columns
                }
            )

    conflicts: list[int] = []
    rows_to_insert: list[dict[str, object]] = []
    with engine.begin() as target_connection:
        target_rows = target_connection.execute(
            select(Student.__table__)
        ).mappings()
        existing = {
            row["id"]: {column: row[column] for column in student_columns}
            for row in target_rows
        }

        for row in source_rows:
            existing_row = existing.get(row["id"])
            if existing_row is None:
                rows_to_insert.append(row)
            elif existing_row != row:
                conflicts.append(row["id"])

        if conflicts:
            raise RuntimeError(
                "Migration stopped without inserting rows because these student "
                "IDs already have different data in PostgreSQL: "
                + ", ".join(str(student_id) for student_id in sorted(conflicts))
            )

        if rows_to_insert:
            target_connection.execute(Student.__table__.insert(), rows_to_insert)

        target_connection.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('students', 'id'), "
                "COALESCE(MAX(id), 1), COUNT(*) > 0) FROM students"
            )
        )

    source_by_id = {row["id"]: row for row in source_rows}
    with engine.connect() as target_connection:
        migrated_rows = target_connection.execute(
            select(Student.__table__).where(
                Student.__table__.c.id.in_(source_by_id)
            )
        ).mappings()
        migrated_by_id = {row["id"]: row for row in migrated_rows}

    missing_ids = set(source_by_id) - set(migrated_by_id)
    mismatched_ids = [
        student_id
        for student_id, source_row in source_by_id.items()
        if student_id in migrated_by_id
        and any(
            migrated_by_id[student_id][column] != source_row[column]
            for column in student_columns
        )
    ]
    if missing_ids or mismatched_ids:
        details = []
        if missing_ids:
            details.append(
                "missing student IDs: " + ", ".join(map(str, sorted(missing_ids)))
            )
        if mismatched_ids:
            details.append(
                "student IDs that differ after migration: "
                + ", ".join(map(str, sorted(mismatched_ids)))
            )
        raise RuntimeError(
            "Post-migration verification failed (" + "; ".join(details) + ")."
        )

    print(
        f"Migration complete: inserted {len(rows_to_insert)} student(s); "
        f"left {len(source_rows) - len(rows_to_insert)} identical existing "
        f"student(s) unchanged; verified {len(migrated_by_id)} source student(s) "
        "by ID and field values."
    )


if __name__ == "__main__":
    main()
