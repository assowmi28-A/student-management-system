"""Explicit, additive database schema migrations."""
from sqlalchemy import Engine, inspect, text

from app.models import Student


STUDENT_NULLABLE_COLUMNS = {
    "email": "VARCHAR(254)",
    "date_of_birth": "DATE",
    "age": "INTEGER",
    "gender": "VARCHAR(20)",
    "blood_group": "VARCHAR(20)",
    "course": "VARCHAR(100)",
    "address": "VARCHAR(500)",
}


def missing_student_columns(engine: Engine) -> set[str]:
    if "students" not in inspect(engine).get_table_names():
        return set()
    existing = {
        column["name"] for column in inspect(engine).get_columns("students")
    }
    return {column.name for column in Student.__table__.columns} - existing


def add_missing_student_columns(engine: Engine) -> list[str]:
    missing = missing_student_columns(engine)
    unsupported = missing - STUDENT_NULLABLE_COLUMNS.keys()
    if unsupported:
        raise RuntimeError(
            "Cannot add missing required student columns automatically: "
            + ", ".join(sorted(unsupported))
        )

    with engine.begin() as connection:
        for column_name in sorted(missing):
            connection.execute(
                text(
                    f'ALTER TABLE students ADD COLUMN "{column_name}" '
                    f"{STUDENT_NULLABLE_COLUMNS[column_name]}"
                )
            )
    return sorted(missing)
