import { useEffect, useState } from "react";
import NavHeader from "../components/navbar";
import { useNavigate } from "react-router-dom";
import "./books.css";
import API_BASE_URL from "../api";
function Books() {

    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const limit = 12;
    const navigate = useNavigate();

    useEffect(() => {
    fetch(`${API_BASE_URL}/books/?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`)
        .then((response) => response.json())
        .then((data) => {
            setBooks(data.books);
            setTotalBooks(data.total);
        })
        .catch((error) => {
            console.error("Error fetching books:", error);
        });
}, [search, page]);

    const totalPages = Math.ceil(totalBooks / limit);
    const handleViewMore = (bookId) => {
    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login");
        return;
    }

    navigate(`/book/${bookId}`);
};

    return (
        <>
            <NavHeader />

            <div className="books-page">
                <div className="books-header">
                    <div>
                        <h1>Books</h1>
                        <p>Explore our collection of books</p>
                    </div>
                    <div className="search-box">

                        <input
                            type="text"
                            placeholder="Search books by title or author..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                        <button>Search</button>
                    </div>
                </div>
                <div className="dynamic-books-container">
                    {books.map((book) => (
                        <div className="book-card" key={book.id}>
                            <img src={book.image_url} alt={book.title}/>
                            <div className="book-card-content">
                                <h2>{book.title}</h2>
                                <p className="book-author">{book.author}</p>
                                <span className="book-genre">{book.genre}</span>
                                <p className="book-copies">Available: {book.available_copies}</p>
                                <button className="borrow-button" onClick={()=> handleViewMore(book.id)}>View more</button>
                            </div>
                        </div>

                    ))}

                </div>
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => (
                            <button
                                key={index + 1}
                                className={
                                    page === index + 1
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() => setPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        )
                    )}
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>

                </div>

            </div>
        </>
    );
}

export default Books;