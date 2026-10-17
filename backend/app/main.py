"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import CORS_ORIGINS
from app.database import Base, engine
from app import models
from app.routers import health, students

app = FastAPI(title="Student Management API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add newly introduced nullable columns before create_all for existing databases.
student_column_migrations = {
    "email": "VARCHAR(254)",
    "date_of_birth": "DATE",
    "gender": "VARCHAR(20)",
    "course": "VARCHAR(100)",
    "address": "VARCHAR(500)",
}
if "students" in inspect(engine).get_table_names():
    existing_columns = {
        column["name"] for column in inspect(engine).get_columns("students")
    }
    with engine.begin() as connection:
        for column_name, column_type in student_column_migrations.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(
                        f'ALTER TABLE students ADD COLUMN "{column_name}" {column_type}'
                    )
                )

Base.metadata.create_all(bind=engine)

app.include_router(health.router)
app.include_router(health.router, prefix="/api")
app.include_router(students.router)
app.include_router(students.router, prefix="/api")
