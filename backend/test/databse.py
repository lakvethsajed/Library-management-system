from fastapi.testclient import TestClient

from backend.app.database import get_db, Base
from backend.app.main import app
from backend.app import schemas
from backend.app.config import settings

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

import pytest


SQL_ALCHEMY_DATABASE_URL = f'postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}_test'

engine = create_engine(SQL_ALCHEMY_DATABASE_URL)

Test_SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


@pytest.fixture
def session():

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = Test_SessionLocal()

    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test(session):

    def Test_get_db():

        try:
            yield session

        finally:
            session.close()

    app.dependency_overrides[get_db] = Test_get_db

    yield TestClient(app)