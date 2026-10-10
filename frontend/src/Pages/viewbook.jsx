import NavHeader from "../components/navbar";
import React from "react";
import "./viewbook.css";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import {
    LuArrowLeft,
    LuBookOpen,
    LuUser,
    LuTag,
} from "react-icons/lu";

import { GiBookshelf } from "react-icons/gi";


export default function ViewBook() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = React.useState(null);
    const [isBorrowed, setIsBorrowed] = React.useState(false);
    const [issueId, setIssueId] = React.useState(null);
    const [loadingAction, setLoadingAction] = React.useState(false);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    React.useEffect(() => {

        fetch(`${API_BASE_URL}/books/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setBook(data);
            })
            .catch((error) => {
                console.error("Error fetching book:", error);
            });

    }, [id]);

    React.useEffect(() => {

        if (role !== "user") {
            return;
        }

        fetch(`${API_BASE_URL}/issues/mybooks`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Could not fetch my books");
                }

                return response.json();
            })
            .then((data) => {

                const activeIssue = data.find(
                    (issue) =>
                        issue.book_id === Number(id) &&
                        issue.returned_at === null
                );

                if (activeIssue) {

                    setIsBorrowed(true);
                    setIssueId(activeIssue.issue_id);

                } else {
                    setIsBorrowed(false);
                    setIssueId(null);
                }

            })
            .catch((error) => {
                console.error("Error fetching borrowed books:", error);
            });

    }, [id, role, token]);

    const handleBorrow = () => {
        setLoadingAction(true);
        fetch(`${API_BASE_URL}/issues/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                book_id: Number(id)
            })
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Could not borrow book");
                }

                return response.json();
            })
            .then((data) => {

                alert("Book borrowed successfully!");
                setIsBorrowed(true);
                setIssueId(data.id);
                setBook((previousBook) => ({
                    ...previousBook,
                    available_copies:
                        previousBook.available_copies - 1
                }));
            })
            .catch((error) => {
               console.error("Error borrowing book:", error);
                alert("Could not borrow the book.");
            })
            .finally(() => {
                setLoadingAction(false);
            });
    };
    const handleReturn = () => {
        if (!issueId) {
            alert("Issue record not found.");
            return;
        }
        setLoadingAction(true);
        fetch(`${API_BASE_URL}/issues/return/${issueId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Could not return book");
                }
                return response.json();
            })
            .then((data) => {
                alert("Book returned successfully!");
                setIsBorrowed(false);
                setIssueId(null);
                setBook((previousBook) => ({
                    ...previousBook,
                    available_copies:
                        previousBook.available_copies + 1
                }));

            })
            .catch((error) => {
                console.error("Error returning book:", error);
                alert("Could not return the book.");
            })
            .finally(() => {
                setLoadingAction(false);
            });
    };

    if (!book) {
        return (
            <>
               <NavHeader />
                <div className="view-book-page">
                    <p>Loading book...</p>
                </div>
            </>
        );

    }
    return (
        <>
           <NavHeader />
            <div className="view-book-page">
                <button className="back-button" onClick={() => navigate("/books")}>
                    <LuArrowLeft />
                    Back to Books
                </button>

                <div className="book-details-card">
                    <div className="book-details-image">
                        <img src={book.image_url} alt={book.title}/>
                    </div>
                    <div className="book-details-content">
                        <h1>{book.title}</h1>
                        <p className="book-details-author">{book.author}</p>
                        <span className="book-details-genre">{book.genre}</span>
                        <div className="book-availability">
                            <div className="availability-item">
                                <span className="availability-icon"><GiBookshelf /></span>
                                <div>
                                    <span>Total Copies</span>
                                    <strong>{book.total_copies}</strong>
                                </div>
                            </div>
                            <div className="availability-divider"></div>
                            <div className="availability-item">
                                <span className="availability-icon"><LuBookOpen /></span>
                                <div>
                                    <span>Available Copies</span>
                                    <strong>{book.available_copies}</strong>
                                </div>
                            </div>     
                            </div>

                        <div className="book-description-section">
                            <h2>Description</h2>
                            <p>{book.description}</p>
                        </div>
                        <div className="book-extra-details">
                            <div className="extra-detail">
                                <span className="extra-icon">
                                    <LuUser />
                                </span>
                                <div>
                                    <span>Author</span>
                                    <strong>{book.author}</strong>
                                </div>
                            </div>
                            <div className="extra-divider"></div>
                            <div className="extra-detail">
                                <span className="extra-icon"><LuTag /></span>
                                <div>
                                    <span>Genre</span>
                                    <strong>{book.genre}</strong>
                                </div>
                            </div>
                        </div>

                        {role === "user" && (
                            <div className="book-actions">
                                {isBorrowed ? (
                                    <button className="return-book-button" onClick={handleReturn}disabled={loadingAction}>
                                        <LuBookOpen />
                                        {loadingAction
                                            ? "Returning..."
                                            : "Return Book"
                                        }
                                    </button>
                                ) : book.available_copies > 0 ? (
                                    <button className="borrow-book-button" onClick={handleBorrow} disabled={loadingAction}>
                                       <LuBookOpen />
                                        {loadingAction
                                            ? "Borrowing..."
                                            : "Borrow Book"
                                        }
                                    </button>
                                ) : (
                                    <button className="borrow-book-button unavailable-button" disabled>
                                        <LuBookOpen />
                                        Currently Unavailable
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}