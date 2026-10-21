"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import Base, engine
from app import models
from app.migrations import missing_student_columns
from app.routers import health, students

app = FastAPI(title="Student Management API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

missing_columns = missing_student_columns(engine)
if missing_columns:
    raise RuntimeError(
        "The students table is missing columns: "
        + ", ".join(sorted(missing_columns))
        + ". Back up the database, then run "
        "`python migrate_student_schema.py --backup-confirmed`."
    )

Base.metadata.create_all(bind=engine)

app.include_router(health.router)
app.include_router(health.router, prefix="/api")
app.include_router(students.router)
app.include_router(students.router, prefix="/api")
