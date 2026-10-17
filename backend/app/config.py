"""Application settings loaded from environment variables."""
import os
from urllib.parse import urlsplit, urlunsplit

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./students.db")
CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

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
