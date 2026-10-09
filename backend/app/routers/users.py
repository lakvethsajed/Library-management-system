from fastapi import status,HTTPException,Depends, APIRouter
from .. import utils
from .. import models
from .. import oauth2
from .. import schemas
from ..database import get_db
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime


router = APIRouter(
    prefix = "/users",
    tags = ['users']
)

@router.post("/", status_code = status.HTTP_201_CREATED,response_model = schemas.responseuser)
async def create_users(new_user: schemas.Registeruser, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == new_user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Username already exists")
    existing_email = db.query(models.User).filter(models.User.email == new_user.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Email already exists")
    hashed_password = utils.hashing(new_user.password)
    new_user.password = hashed_password
    newuser = models.User(**new_user.dict())
    db.add(newuser)
    db.commit()
    db.refresh(newuser)
    return newuser
@router.get("/me", response_model=schemas.CurrentUserResponse)
async def get_current_user(
    current_user = Depends(oauth2.current_user)
):
    return current_user

@router.get("/all", response_model=List[schemas.AllUserResponse])
async def get_all_users(search: str = "",db: Session = Depends(get_db),current_user = Depends(oauth2.admin_user)):
    users = db.query(models.User).filter(
        (models.User.name.ilike(f"%{search}%")) |
        (models.User.username.ilike(f"%{search}%")) |
        (models.User.email.ilike(f"%{search}%"))
    ).all()
    result = []
    for user in users:
        session = (db.query(models.Login_session).filter(models.Login_session.user_id == user.id,models.Login_session.revoked == False,models.Login_session.expiry_time > datetime.now()).first())
        result.append({
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "is_logged_in": session is not None
        })

    return result

@router.get("/{id}",response_model = schemas.responseuser)
async def get_user(id : int,db:Session = Depends(get_db),current_user = Depends(oauth2.admin_user)):
    user =db.query(models.User).filter(models.User.id == id).first()
    if not user :
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail = f"The user with {id} is not found")
    return user 

def create_admin(db: Session = Depends(get_db)):
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if admin is not None:
        return
    hashed_password = utils.hashing("Admin@123")
    new_admin = models.User(
        name = "Library Admin",
        username = "admin",
        email = "admin@library.com",
        password = hashed_password,
        role = "admin"
    )
    db.add(new_admin)
    db.commit()

    db.refresh(new_admin)


@router.delete("/me")
async def delete_my_account(db: Session = Depends(get_db),current_user = Depends(oauth2.normal_user)):
    borrowed_book = db.query(models.Bookissue).filter(models.Bookissue.user_id == current_user.id,models.Bookissue.returned_at == None).first()
    if borrowed_book is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="You cannot delete your account until you return all borrowed books")
    db.delete(current_user)
    db.commit()
    return {"data": "Your account has been deleted successfully"}