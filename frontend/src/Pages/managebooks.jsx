import NavHeader from "../components/navbar";
import "./managebooks.css";
import API_BASE_URL from "../api";
import React from "react";
export default function Manage() {
    const [books, setbooks] = React.useState([])
    const [search, setsearch] = React.useState("")
    const [formbuttom, setform] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [totalBooks, setTotalBooks] = React.useState(0)
    const limit = 10;
    const [newBook, setnewBook] = React.useState({
        title: "",
        author : "",
        genre : "",
        description : "",
        total_copies : 1,
        image_url : ""
    });
   React.useEffect(() => {
    fetch(
        `${API_BASE_URL}/books/?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
    )
        .then((response) => response.json())
        .then((data) => {

            setbooks(data.books);
            setTotalBooks(data.total);

        })
        .catch((error) => {
            console.error("Error while fetching books", error);
        });

}, [search, page]);
const totalPages = Math.ceil(totalBooks / limit);
    
    async function handleAddBook(e){
        e.preventDefault();
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/books/`,{
            method : "POST",
            headers : {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },body: JSON.stringify({
                title: newBook.title,
                author: newBook.author,
                genre: newBook.genre,
                description: newBook.description,
                total_copies: Number(newBook.total_copies),
                image_url: newBook.image_url
            })
        });
        const data = await response.json()
        if(response.ok){
            setbooks((books) => [...books, data]);
            setnewBook({
                title : "",
                author: "",
                genre : "",
                description : "",
                image_url : "",
                total_copies : 1
            })
           setform(false);
        }else{
            alert(data.detail);
        }
    }

    async function handleDelete(id) {

    const token = localStorage.getItem("token");

    console.log("Deleting book:", id);

    const response = await fetch(`${API_BASE_URL}/books/${id}`,
        {
            method: "DELETE",
            headers :{
                "Authorization" : `Bearer ${token}`
            }
        }
    );

    console.log("Status:", response.status);

    const data = await response.json();

    console.log("Response:", data);

    if (response.ok) {

        setbooks((books) =>
            books.filter((book) => book.id !== id)
        );

    } else {

        console.log("Delete failed:", data);

    }
}
    async function handleDeleteCopies(id){
        const input =prompt("How many copies do u want to delete? ")
        if (input === null){
            return;
        }
        const copies = Number(input);
        if (copies <= 0 || isNaN(copies)){
            alert("Give me right number");
            return;
        }
        const token = localStorage.getItem("token")
        const response = await fetch( `${API_BASE_URL}/books/${id}/copies?copies=${copies}`,{
            method:"DELETE",
            headers:{
                "Authorization" : `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
        if(response.ok){
            setbooks((books) =>
            books.map((book) =>
                book.id === id
                    ? {
                        ...book,
                        total_copies: data.total_copies,
                        available_copies: data.available_copies
                    }
                    : book
            ));
        }else{
            alert(data.detail)
        }
    }
    async function handleUpdate(book){
        const title = prompt("Enter new title",book.title);
        if(title == null){
            return;
        }
        const author = prompt("Enter new author", book.author);
        if(author == null){
            return;
        }
        const genre = prompt("Enter new book genre", book.genre);
        if(genre == null){
            return;
        }
        const description = prompt("Enter new book description", book.description || "");
        if(description == null){
            return;
        }
        const total_copies = prompt("Enter the total copies u need to add", book.total_copies)
        if(total_copies == null){
            return;
        }
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/books/${book.id}`,{
            method :"PUT",
            headers :{
                "Authorization" : `Bearer ${token}`,
                "Content-Type": "application/json"

            },
            body : JSON.stringify({
                title : title,
                author : author,
                genre : genre,
                description : description,
                total_copies : Number(total_copies)

            })
        }
        );
        const data = await response.json()
         if (response.ok) {
            setbooks((books) =>
                books.map((oldBook) =>
                oldBook.id === book.id
                    ? data
                    : oldBook
            )
        );

    } else {

        alert(data.detail);

    }

    }

    return (
        <>
            <NavHeader />

            <div className="manage-books-page">
                 {formbuttom &&(
                       <div className="add-book-form-container">
                        <form className="add-book-form" onSubmit={handleAddBook}>
                            <div className="add-book-form-header">
                                <h2>Add New Book</h2>
                                <button className="close-form-button" onClick={()=> setform(false)} type="button">x</button>
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Book Title</label>
                                    <input type="text" placeholder="Enter the book title you want to add..." value={newBook.title} 
                                    onChange={(e)=> setnewBook({...newBook,title: e.target.value})}/>
                                </div>
                                  <div className="form-field">
                                    <label>Book Author</label>
                                    <input type="text" placeholder="Enter the new Book author..." value={newBook.author}
                                    onChange={(e)=> setnewBook({...newBook, author: e.target.value})}/>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Book Genre</label>
                                    <input type="text" placeholder="Enter the new Book Genre..." value={newBook.genre}
                                    onChange={(e)=> setnewBook({...newBook, genre: e.target.value})}/>
                                </div>
                                <div className="form-field">
                                    <label>Total Copies</label>
                                    <input type="number" min="1" placeholder="Enter the no of Copies you wish to add..." value={newBook.total_copies}
                                    onChange={(e)=> setnewBook({...newBook, total_copies: e.target.value})}/>
                                </div>
                            </div>
                            <label>Description</label>
                            <textarea placeholder="Enter book description" value={newBook.description} 
                            onChange={(e) => setnewBook({
                                ...newBook,description: e.target.value
                            })}/>
                            <label>Image URL</label>
                            <input type="text" placeholder="Enter image URL" value={newBook.image_url} 
                            onChange={(e) => setnewBook({
                                ...newBook, image_url: e.target.value
                            })}/>
                            <div className="add-form-buttons">
                                <button type="button" className="cancel-button"onClick={() => setform(false)}>Cancel</button>
                                <button type="submit" className="save-book-button">Add Book</button>
                            </div>

                        </form>
                       </div>
                    )}

                <div className="manage-top">
                    <div className="manage-books-header">
                        <h1>Manage Books</h1>

                        <p>
                            Add new books, update existing books, or remove them
                            from the collection.
                        </p>

                        <button className="Add-book-button" onClick={() => setform(true)}>
                            + Add Book
                        </button>
                    </div>
                    <div className="manage-search">
                        <input type="text" placeholder="Enter the book name or author name" value={search} onChange={(e)=>setsearch(e.target.value)}/>
                        <button>Submit</button>
                    </div>

                </div>

                <table className="books-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Genre</th>
                            <th>Total Copies</th>
                            <th>Available Copies</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.id}</td>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.genre}</td>
                                <td>{book.total_copies}</td>
                                <td>{book.available_copies}</td>
                                <td><button className="delete-button" onClick={()=> handleDelete(book.id)}>Delete</button>
                                <button className="copies-button" onClick={() => handleDeleteCopies(book.id)}>Delete Copies</button>
                                <button className="update-button" onClick={() => handleUpdate(book)}>Edit</button>
                                </td>
                            </tr>
                            
                            
                            
                    ))}

                    </tbody>

                </table>
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
                    {Array.from({ 
                        length: totalPages },(_, index) => (
                        <button key={index + 1} className={page === index + 1 ? "active-page" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>
                    ))}
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
                    </div>
            </div>
        </>
    );
}