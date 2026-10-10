
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

if settings.database_url:
    SQL_ALCHEMY_DATABASE_URL = settings.database_url
else:
    required = [
        settings.database_username,
        settings.database_hostname,
        settings.database_name,
        settings.database_password,
    ]

    if not all(required):
        raise ValueError(
            "Set DATABASE_URL or all required database settings."
        )

    SQL_ALCHEMY_DATABASE_URL = (
        f"postgresql://{settings.database_username}:"
        f"{settings.database_password}@{settings.database_hostname}:"
        f"{settings.database_port}/{settings.database_name}"
    )

engine = create_engine(SQL_ALCHEMY_DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
