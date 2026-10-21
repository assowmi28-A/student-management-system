"""Application settings loaded from environment variables."""
import os
from urllib.parse import urlsplit, urlunsplit

from dotenv import load_dotenv

load_dotenv()

IS_PRODUCTION = (
    os.getenv("RENDER", "").strip().lower() in {"1", "true", "yes"}
    or os.getenv("VERCEL", "").strip().lower() in {"1", "true", "yes"}
    or os.getenv("APP_ENV", "").strip().lower() in {"prod", "production"}
)
DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip()
if not DATABASE_URL:
    if IS_PRODUCTION:
        raise RuntimeError(
            "DATABASE_URL must be configured in production to use persistent storage."
        )
    DATABASE_URL = "sqlite:///./students.db"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL.removeprefix("postgres://")
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL.removeprefix(
        "postgresql://"
    )
elif DATABASE_URL.startswith("postgresql+psycopg2://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL.removeprefix(
        "postgresql+psycopg2://"
    )

if IS_PRODUCTION and not DATABASE_URL.startswith("postgresql+psycopg://"):
    raise RuntimeError(
        "Production requires a PostgreSQL DATABASE_URL; SQLite is not persistent."
    )

PRODUCTION_FRONTEND_ORIGIN = "https://student-management-system-1-tfpl.onrender.com"
CORS_ORIGINS: list[str] = list(
    dict.fromkeys(
        origin.strip().rstrip("/")
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    )
)
if PRODUCTION_FRONTEND_ORIGIN not in CORS_ORIGINS:
    CORS_ORIGINS.append(PRODUCTION_FRONTEND_ORIGIN)

for origin in tuple(CORS_ORIGINS):
    parsed_origin = urlsplit(origin)
    if parsed_origin.hostname == "localhost":
        alternate_host = "127.0.0.1"
    elif parsed_origin.hostname == "127.0.0.1":
        alternate_host = "localhost"
    else:
        continue

    host_port = parsed_origin.netloc.replace(
        parsed_origin.hostname,
        alternate_host,
        1,
    )
    alternate_origin = urlunsplit(
        (
            parsed_origin.scheme,
            host_port,
            parsed_origin.path,
            parsed_origin.query,
            parsed_origin.fragment,
        )
    )
    if alternate_origin not in CORS_ORIGINS:
        CORS_ORIGINS.append(alternate_origin)
