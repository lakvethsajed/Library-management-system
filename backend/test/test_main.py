from backend.app import models

from .databse import test,session
from backend.app import schemas
from backend.app import utils

import pytest

def test_root(test):
    res = test.get("/")
    print(res.json().get('message'))
    assert res.json().get('message') == 'Welcome to Library'

def test_create_user(test):
    res = test.post("/users/",json={"name": "sheeru", "username" : "seerat", "email" : "seerat@gmail.com" ,"password" : "Seerathul@180598"})
    new_user = schemas.responseuser(**res.json())
    assert new_user.username == "seerat"
    assert res.status_code == 201


def test_login(test):
    test.post("/users/",json={"name": "sheeru", "username" : "seerat", "email" : "seerat@gmail.com" ,"password" : "Seerathul@180598"})
    res = test.post("/login", data={"username": "seerat", "password": "Seerathul@180598"})
    print(res.json())
    assert res.status_code == 200


@pytest.mark.parametrize("username,password",[
    ("seerat","password@123"),
    ("user","Seerathul@180598")
])
def test_incorrect_login(test,username,password):
    test.post("/users/",json={"name": "sheeru", "username" : "seerat", "email" : "seerat@gmail.com" ,"password" : "Seerathul@180598"})

    res = test.post("/login",data={"username": username,"password": password})

    assert res.status_code == 403


def test_duplicate_username(test):
    test.post("/users/",json={"name": "sheeru", "username" : "seerat", "email" : "seerat@gmail.com" ,"password" : "Seerathul@180598"})

    res = test.post("/users/",json={"name": "another","username": "seerat","email": "another@gmail.com","password": "Seerathul@180598"})
    assert res.status_code == 409
    assert res.json()["detail"] == "Username already exists"


def test_duplicate_email(test):
    test.post("/users/",json={"name": "sheeru", "username" : "seerat", "email" : "seerat@gmail.com" ,"password" : "Seerathul@180598"})
    res = test.post("/users/",json={"name": "another","username": "anotheruser","email": "seerat@gmail.com","password": "Another@123"})
    assert res.status_code == 409
    assert res.json()["detail"] == "Email already exists"


def test_create_book(test,session):
    from backend.app import utils
    admin = models.User(name="Library Admin",username="admin",email="admin@library.com",password=utils.hashing("Admin@123"),role="admin")
    session.add(admin)
    session.commit()
    login = test.post("/login",data={"username":"admin","password":"Admin@123"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    books = [{"title": "Python","author": "John","genre": "Programming","description": "Python book","total_copies": 5,"available_copies": 5},{"title": "FastAPI","author": "Sebastian","genre": "Backend","description": "FastAPI book","total_copies": 3,"available_copies": 3},{"title": "PostgreSQL","author": "David","genre": "Database","description": "PostgreSQL book","total_copies": 4,"available_copies": 4}]
    for book in books:
        res = test.post("/books/",json=book,headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 201
        assert res.json()["title"] == book["title"]


def test_delete_copies(test,session):
    admin = models.User(name="Library Admin",username="admin",email="admin@library.com",password=utils.hashing("Admin@123"),role="admin")
    session.add(admin)
    session.commit()
    login = test.post("/login",data={"username":"admin","password":"Admin@123"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    book = test.post("/books/",json={"title":"Python","author":"John","genre":"Programming","description":"Python book","total_copies":5,"available_copies":5},headers={"Authorization": f"Bearer {token}"})
    assert book.status_code == 201
    book_id = book.json()["id"]
    res = test.delete(f"/books/{book_id}/copies",params={"copies":2},headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["total_copies"] == 3
    assert res.json()["available_copies"] == 3

def test_update_book(test,session):
    admin = models.User(name="Library Admin",username= "admin",email="admin@library.com",password=utils.hashing("Admin@123"),role="admin")
    session.add(admin)
    session.commit()
    login = test.post("/login", data={"username": "admin", "password": "Admin@123"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    book = test.post("/books/",json={"title":"Python","author":"xxxx","genre":"Programming","description":"Python book","total_copies":5,"available_copies":5},headers={"Authorization": f"Bearer {token}"})
    book_id = book.json()["id"]
    res = test.put(f"/books/{book_id}",json={"title":"Advanced Python","author":"xxxx","genre":"Programming","description":"Advanced Python book","total_copies":10,"available_copies":10},headers={"Authorization":f"Bearer {token}"})
    assert res.status_code == 200

def test_borrow_book(test,session):
    from backend.app import utils
    admin = models.User(name="Library Admin",username="admin",email="admin@library.com",password=utils.hashing("Admin@123"),role="admin")
    session.add(admin)
    session.commit()
    login = test.post("/login",data={"username":"admin","password":"Admin@123"})
    admin_token = login.json()["access_token"]
    book = test.post("/books/",json={"title":"Python","author":"John","genre":"Programming","description":"Python book","total_copies":5,"available_copies":5},headers={"Authorization":f"Bearer {admin_token}"})
    book_id = book.json()["id"]
    test.post("/users/",json={"name":"sheeru","username":"seerat","email":"seerat@gmail.com","password":"Seerathul@180598"})
    login = test.post("/login",data={"username":"seerat","password":"Seerathul@180598"})
    user_token = login.json()["access_token"]
    res = test.post("/issues/",json={"book_id":book_id},headers={"Authorization":f"Bearer {user_token}"})
    assert res.status_code == 201
    assert res.json()["book_id"] == book_id
    assert res.json()["returned_at"] is None

def test_return_book(test,session):
    from backend.app import utils
    admin = models.User(name="Library Admin",username="admin",email="admin@library.com",password=utils.hashing("Admin@123"),role="admin")
    session.add(admin)
    session.commit()
    login = test.post("/login",data={"username":"admin","password":"Admin@123"})
    admin_token = login.json()["access_token"]
    book = test.post("/books/",json={"title":"Python","author":"John","genre":"Programming","description":"Python book","total_copies":5,"available_copies":5},headers={"Authorization":f"Bearer {admin_token}"})
    book_id = book.json()["id"]
    test.post("/users/",json={"name":"sheeru","username":"seerat","email":"seerat@gmail.com","password":"Seerathul@180598"})
    login = test.post("/login",data={"username":"seerat","password":"Seerathul@180598"})
    user_token = login.json()["access_token"]
    issue = test.post("/issues/",json={"book_id":book_id},headers={"Authorization":f"Bearer {user_token}"})
    issue_id = issue.json()["id"]
    res = test.put(f"/issues/return/{issue_id}",headers={"Authorization":f"Bearer {user_token}"})
    assert res.status_code == 200
    assert res.json()["returned_at"] is not None

def test_delete_user(test):
    test.post("/users/",json={"name":"sheeru","username":"seerat","email":"seerat@gmail.com","password":"Seerathul@180598"})
    login = test.post("/login",data={"username":"seerat","password":"Seerathul@180598"})
    token = login.json()["access_token"]
    res = test.delete("/users/me",headers={"Authorization":f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["data"] == "Your account has been deleted successfully"

def test_logout_user(test):
    test.post("/users/",json={"name":"sheeru","username":"seerat","email":"seerat@gmail.com","password":"Seerathul@180598"})
    login = test.post("/login",data={"username":"seerat","password":"Seerathul@180598"})
    token = login.json()["access_token"]
    res = test.post("/logout",headers={"Authorization":f"Bearer {token}"})
    assert res.status_code == 200