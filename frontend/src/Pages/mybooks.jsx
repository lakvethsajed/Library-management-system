import NavHeader from "../components/navbar";
import "./mybooks.css";
import React from "react";
import API_BASE_URL from "../api";
export default function MyBooks() {

    const [books, setBooks] = React.useState([]);

    React.useEffect(() => {

        const token = localStorage.getItem("token");

        fetch(`${API_BASE_URL}/issues/mybooks`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Failed to fetch my books");
                }

                return response.json();
            })
            .then((data) => {
                setBooks(data);
            })
            .catch((error) => {
                console.log("Error:", error);
            });

    }, []);


    return (
        <>
            <NavHeader />

            <div className="mybooks-page">

                <div className="mybooks-header">
                    <div>
                        <h1>My Books</h1>
                        <p>View the books you have borrowed and their status.</p>
                    </div>
                </div>


                <table className="mybooks-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Book Name</th>
                            <th>Issued On</th>
                            <th>Due Date</th>
                            <th>Returned On</th>
                            <th>Status</th>
                        </tr>
                    </thead>


                    <tbody>

                        {books.map((book) => (

                            <tr key={book.issue_id}>

                                <td>
                                    {book.issue_id}
                                </td>

                                <td>
                                    {book.book_name}
                                </td>

                                <td>
                                    {book.issued_at
                                        ? new Date(book.issued_at).toLocaleDateString()
                                        : "-"
                                    }
                                </td>

                                <td>
                                    {book.due_date
                                        ? new Date(book.due_date).toLocaleDateString()
                                        : "-"
                                    }
                                </td>

                                <td>
                                    {book.returned_at
                                        ? new Date(book.returned_at).toLocaleDateString()
                                        : "-"
                                    }
                                </td>

                                <td>
                                    <span
                                        className={
                                            book.returned_at
                                                ? "returned-book"
                                                : "borrowed-book"
                                        }
                                    >
                                        {book.returned_at
                                            ? "Returned"
                                            : "Borrowed"
                                        }
                                    </span>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>
        </>
    );
}