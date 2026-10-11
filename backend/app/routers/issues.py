from fastapi import APIRouter,status, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import models, oauth2
from ..database import get_db
from .. import schemas
from typing import List
from datetime import datetime, timedelta , timezone


router = APIRouter(
    prefix = "/issues",
    tags = ['issues']
)

@router.post("/", status_code = status.HTTP_201_CREATED , response_model = schemas.ResponseBook)
async def issue_book(bookissue : schemas.Issuebooks, db : Session = Depends(get_db),current_user = Depends(oauth2.normal_user)):
    book = db.query(models.Post).filter(models.Post.id == bookissue.book_id).first()
    if book is None:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = f"The book with the id {bookissue.book_id} is not found in the database")
    if book.available_copies == 0:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = f"The book of id {bookissue.book_idid} is already issued and currently unavailable")
    issued_time = datetime.now(timezone.utc)
    due_time = datetime.now(timezone.utc) + timedelta(days=15)

    newbook = models.Bookissue(user_id = current_user.id,book_id = bookissue.book_id,issued_at = issued_time,due_date = due_time)
    db.add(newbook)
    book.available_copies = book.available_copies - 1
    db.commit()
    db.refresh(newbook)
    return newbook


@router.put("/return/{id}")
async def return_book(id: int,db: Session = Depends(get_db),current_user = Depends(oauth2.normal_user)):
    issue = db.query(models.Bookissue).filter(models.Bookissue.id == id).first()
    if issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Issue record not found")
    if issue.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You cannot return another user's book")
    if issue.returned_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Book has already been returned")
    issue.return_requested = True
    db.commit()
    db.refresh(issue)
    return {
        "message": "Return request submitted. Awaiting admin confirmation.",
        "issue_id": issue.id,
        "return_requested": issue.return_requested
    }


@router.get("/mybooks",response_model=List[schemas.MyBookResponse])
async def my_books(db: Session = Depends(get_db),current_user = Depends(oauth2.normal_user)):
    issued_books = db.query(
        models.Bookissue.id,
        models.User.id.label("user_id"),
        models.User.name.label("user_name"),
        models.Post.id.label("book_id"),
        models.Post.title.label("book_name"),
        models.Bookissue.issued_at,
        models.Bookissue.due_date,
        models.Bookissue.returned_at
    ).join(
        models.User,
        models.Bookissue.user_id == models.User.id
    ).join(
        models.Post,
        models.Bookissue.book_id == models.Post.id
    ).filter(
        models.Bookissue.user_id == current_user.id
    ).all()

    return [
        {
            "issue_id": issue.id,
            "user_id": issue.user_id,
            "user_name": issue.user_name,
            "book_id": issue.book_id,
            "book_name": issue.book_name,
            "issued_at": issue.issued_at,
            "due_date": issue.due_date,
            "returned_at": issue.returned_at
        }
        for issue in issued_books
    ]
@router.get("/all", response_model=schemas.PaginatedIssues)
async def all_books(db: Session = Depends(get_db),limit: int = 10,page: int = 1,search: str = "",current_user = Depends(oauth2.admin_user)):
    query = db.query(
        models.Bookissue.id,
        models.User.id.label("user_id"),
        models.User.name.label("user_name"),
        models.Post.id.label("book_id"),
        models.Post.title.label("book_name"),
        models.Bookissue.issued_at,
        models.Bookissue.due_date,
        models.Bookissue.returned_at
    ).join(
        models.User,
        models.Bookissue.user_id == models.User.id
    ).join(
        models.Post,
        models.Bookissue.book_id == models.Post.id
    ).filter(
        (models.User.name.ilike(f"%{search}%")) |
        (models.Post.title.ilike(f"%{search}%"))
    )

    total = query.count()
    offset = (page - 1) * limit
    issued_books = query.offset(offset).limit(limit).all()
    return {
        "issues": [
            {
                "issue_id": issue.id,
                "user_id": issue.user_id,
                "user_name": issue.user_name,
                "book_id": issue.book_id,
                "book_name": issue.book_name,
                "issued_at": issue.issued_at,
                "due_date": issue.due_date,
                "returned_at": issue.returned_at
            }
            for issue in issued_books
        ],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.put("/confirm-return/{id}")
async def confirm_return(id: int,db: Session = Depends(get_db),current_admin = Depends(oauth2.admin_user)):
    issue = db.query(models.Bookissue).filter(models.Bookissue.id == id).first()
    if issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Issue record not found")
    if issue.returned_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Book has already been returned")
    if not issue.return_requested:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="The user has not requested a return")
    book = db.query(models.Post).filter(models.Post.id == issue.book_id).first()
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Book not found")
    issue.returned_at = datetime.now(timezone.utc)
    issue.return_requested = False
    book.available_copies += 1
    book.available = book.available_copies > 0

    db.commit()
    db.refresh(issue)

    return {
        "message": "Book return confirmed successfully",
        "issue_id": issue.id,
        "returned_at": issue.returned_at
    }
