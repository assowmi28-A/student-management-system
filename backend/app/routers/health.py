"""Health check endpoint used to verify frontend-to-backend communication."""
from fastapi import APIRouter
from sqlalchemy import text

from app.database import engine

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}
