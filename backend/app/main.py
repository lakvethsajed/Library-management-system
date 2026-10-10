from fastapi import FastAPI
from . import models
from .database import SessionLocal
from . import config
from .routers import users
from fastapi.middleware.cors import CORSMiddleware
from .routers.users import create_admin

from .routers import auth
from .routers import books
from .routers import issues

app = FastAPI()

@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        create_admin(db)
    finally:
        db.close()
origins = [
       "http://localhost:5173 ",
        "http://127.0.0.1:5173",]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
app.include_router(books.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(issues.router)
@app.get("/")
def message():
    return {"message": "Welcome to Library"}

