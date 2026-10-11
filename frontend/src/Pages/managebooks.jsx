import NavHeader from "../components/navbar";
import "./managebooks.css";
import API_BASE_URL from "../api";
import React from "react";

export default function Manage() {
    const [books, setbooks] = React.useState([]);
    const [search, setsearch] = React.useState("");
    const [formbuttom, setform] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [totalBooks, setTotalBooks] = React.useState(0);
    const limit = 10;

    const [newBook, setnewBook] = React.useState({
        title: "",
        author: "",
        genre: "",
        description: "",
        total_copies: 1,
        image_url: ""
    });
    const [titleError, setTitleError] = React.useState("");
    const [authorError, setAuthorError] = React.useState("");
    const [genreError, setGenreError] = React.useState("");
    const [copiesError, setCopiesError] = React.useState("");
    const [imageUrlError, setImageUrlError] = React.useState("");

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

    async function handleAddBook(e) {
        e.preventDefault();
        if (
            !newBook.title.trim() ||
            !newBook.author.trim() ||
            !newBook.genre.trim() ||
            titleError ||
            authorError ||
            genreError ||
            copiesError ||
            imageUrlError
        ) {
            setTitleError(
                !newBook.title.trim()
                    ? "Book title is required."
                    : titleError
            );
            setAuthorError(
                !newBook.author.trim()
                    ? "Author name is required."
                    : authorError
            );
            setGenreError(
                !newBook.genre.trim()
                    ? "Genre is required."
                    : genreError
            );
            setCopiesError(
                !Number.isInteger(Number(newBook.total_copies)) ||
                Number(newBook.total_copies) < 1
                    ? "Copies must be a whole number greater than 0."
                    : copiesError
            );
            return;
        }

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/books/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: newBook.title.trim(),
                author: newBook.author.trim(),
                genre: newBook.genre.trim(),
                description: newBook.description,
                total_copies: Number(newBook.total_copies),
                image_url: newBook.image_url.trim()
            })
        });

        const data = await response.json();

        if (response.ok) {
            setbooks((books) => [...books, data]);

            setnewBook({
                title: "",
                author: "",
                genre: "",
                description: "",
                image_url: "",
                total_copies: 1
            });

            setTitleError("");
            setAuthorError("");
            setGenreError("");
            setCopiesError("");
            setImageUrlError("");

            setform(false);
        } else {
            alert(data.detail);
        }
    }

    async function handleDelete(id) {
        const token = localStorage.getItem("token");

        console.log("Deleting book:", id);

        const response = await fetch(`${API_BASE_URL}/books/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

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

    async function handleDeleteCopies(id) {
        const input = prompt("How many copies do u want to delete? ");

        if (input === null) {
            return;
        }

        const copies = Number(input);

        if (copies <= 0 || !Number.isInteger(copies)) {
            alert("Give me right number");
            return;
        }

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/books/${id}/copies?copies=${copies}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("Status:", response.status);
        console.log("Response:", data);

        if (response.ok) {
            setbooks((books) =>
                books.map((book) =>
                    book.id === id
                        ? {
                            ...book,
                            total_copies: data.total_copies,
                            available_copies: data.available_copies
                        }
                        : book
                )
            );
        } else {
            alert(data.detail);
        }
    }

    async function handleUpdate(book) {
        const title = prompt("Enter new title", book.title);
        if (title === null) return;

        const author = prompt("Enter new author", book.author);
        if (author === null) return;

        const genre = prompt("Enter new book genre", book.genre);
        if (genre === null) return;

        const description = prompt(
            "Enter new book description",
            book.description || ""
        );
        if (description === null) return;

        const total_copies = prompt(
            "Enter the total copies you need",
            book.total_copies
        );
        if (total_copies === null) return;

        const cleanTitle = title.trim();
        const cleanAuthor = author.trim();
        const cleanGenre = genre.trim();
        const cleanDescription = description.trim();
        const copies = Number(total_copies);

        if (!cleanTitle || !cleanAuthor || !cleanGenre) {
            alert("Title, author, and genre cannot be empty.");
            return;
        }

        const namePattern = /^[A-Za-z0-9 ]+$/;

        if (!namePattern.test(cleanTitle)) {
            alert("Book title can contain only letters, numbers, and spaces.");
            return;
        }

        if (!namePattern.test(cleanAuthor)) {
            alert("Author name can contain only letters, numbers, and spaces.");
            return;
        }

        const genrePattern = /^[A-Za-z ]+$/;

        if (!genrePattern.test(cleanGenre)) {
            alert("Genre can contain only letters and spaces.");
            return;
        }

        if (
            total_copies.trim() === "" ||
            !Number.isInteger(copies) ||
            copies < 1
        ) {
            alert("Total copies must be a whole number greater than 0.");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_BASE_URL}/books/${book.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: cleanTitle,
                        author: cleanAuthor,
                        genre: cleanGenre,
                        description: cleanDescription,
                        total_copies: copies
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setbooks((books) =>
                    books.map((oldBook) =>
                        oldBook.id === book.id ? data : oldBook
                    )
                );

                alert("Book updated successfully!");
            } else {
                alert(
                    typeof data.detail === "string"
                        ? data.detail
                        : "Could not update the book. Please check your inputs."
                );
            }
        } catch (error) {
            console.error("Error updating book:", error);
            alert("Could not connect to the server. Please try again.");
        }
    }

    return (
        <>
            <NavHeader />

            <div className="manage-books-page">
                {formbuttom && (
                    <div className="add-book-form-container">
                        <form
                            className="add-book-form"
                            onSubmit={handleAddBook}
                        >
                            <div className="add-book-form-header">
                                <h2>Add New Book</h2>
                                <button
                                    className="close-form-button"
                                    onClick={() => setform(false)}
                                    type="button"
                                >
                                    x
                                </button>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>
                                        Book Title <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter the book title..."
                                        value={newBook.title}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setnewBook({
                                                ...newBook,
                                                title: value
                                            });

                                            if (!value.trim()) {
                                                setTitleError("Book title is required.");
                                            } else if (!/^[A-Za-z0-9 ]+$/.test(value)) {
                                                setTitleError(
                                                    "Title can contain only letters, numbers, and spaces."
                                                );
                                            } else {
                                                setTitleError("");
                                            }
                                        }}
                                        required
                                    />
                                    {titleError && (
                                        <span className="validation-error">
                                            {titleError}
                                        </span>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label>
                                        Book Author <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter the book author..."
                                        value={newBook.author}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setnewBook({
                                                ...newBook,
                                                author: value
                                            });

                                            if (!value.trim()) {
                                                setAuthorError("Author name is required.");
                                            } else if (!/^[A-Za-z ]+$/.test(value)) {
                                                setAuthorError(
                                                    "Author can contain only letters and spaces."
                                                );
                                            } else {
                                                setAuthorError("");
                                            }
                                        }}
                                        required
                                    />
                                    {authorError && (
                                        <span className="validation-error">
                                            {authorError}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>
                                        Book Genre <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter the book genre..."
                                        value={newBook.genre}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setnewBook({
                                                ...newBook,
                                                genre: value
                                            });

                                            if (!value.trim()) {
                                                setGenreError("Genre is required.");
                                            } else if (!/^[A-Za-z ]+$/.test(value)) {
                                                setGenreError(
                                                    "Genre must contain only letters and spaces."
                                                );
                                            } else {
                                                setGenreError("");
                                            }
                                        }}
                                        required
                                    />
                                    {genreError && (
                                        <span className="validation-error">
                                            {genreError}
                                        </span>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label>
                                        Total Copies <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="Enter the number of copies..."
                                        value={newBook.total_copies}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setnewBook({
                                                ...newBook,
                                                total_copies: value
                                            });

                                            if (
                                                value.trim() === "" ||
                                                !Number.isInteger(Number(value)) ||
                                                Number(value) < 1
                                            ) {
                                                setCopiesError(
                                                    "Copies must be a whole number greater than 0."
                                                );
                                            } else {
                                                setCopiesError("");
                                            }
                                        }}
                                        required
                                    />
                                    {copiesError && (
                                        <span className="validation-error">
                                            {copiesError}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <label>Description</label>
                            <textarea
                                placeholder="Enter book description (optional)"
                                value={newBook.description}
                                onChange={(e) =>
                                    setnewBook({
                                        ...newBook,
                                        description: e.target.value
                                    })
                                }
                            />

                            <label>
                                Image URL <span className="required-star">*</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com/book-image.jpg"
                                value={newBook.image_url}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setnewBook({
                                        ...newBook,
                                        image_url: value
                                    });

                                    if (!value.trim()) {
                                        setImageUrlError("Image URL is required.");
                                    } else {
                                        try {
                                            const url = new URL(value);
                                            if (
                                                url.protocol !== "http:" &&
                                                url.protocol !== "https:"
                                            ) {
                                                setImageUrlError(
                                                    "URL must start with http:// or https://."
                                                );
                                            } else {
                                                setImageUrlError("");
                                            }
                                        } catch {
                                            setImageUrlError("Enter a valid image URL.");
                                        }
                                    }
                                }}
                                required
                            />
                            {imageUrlError && (
                                <span className="validation-error">
                                    {imageUrlError}
                                </span>
                            )}

                            <div className="add-form-buttons">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setform(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-book-button"
                                >
                                    Add Book
                                </button>
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
                        <button
                            className="Add-book-button"
                            onClick={() => setform(true)}
                        >
                            + Add Book
                        </button>
                    </div>

                    <div className="manage-search">
                        <input
                            type="text"
                            placeholder="Enter the book name or author name"
                            value={search}
                            onChange={(e) => setsearch(e.target.value)}
                        />
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
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(book.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="copies-button"
                                        onClick={() => handleDeleteCopies(book.id)}
                                    >
                                        Delete Copies
                                    </button>
                                    <button
                                        className="update-button"
                                        onClick={() => handleUpdate(book)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        ‹
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => (
                            <button
                                key={index + 1}
                                className={
                                    page === index + 1 ? "active-page" : ""
                                }
                                onClick={() => setPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        )
                    )}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        ›
                    </button>
                </div>
            </div>
        </>
    );
}
