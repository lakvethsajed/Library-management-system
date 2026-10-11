
import Navheader from "../components/navbar";
import "./issues.css";
import React from "react";
import API_BASE_URL from "../api";

export default function ViewIssue() {

    const [issues, setIssues] = React.useState([]);
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [totalIssues, setTotalIssues] = React.useState(0);
    const limit = 10;

    React.useEffect(() => {

        const token = localStorage.getItem("token");

        fetch(
            `${API_BASE_URL}/issues/all?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            }
        )
            .then(response => response.json())
            .then((data) => {

                setIssues(data.issues);
                setTotalIssues(data.total);

            })
            .catch((error) => {
                console.log("Error:", error);
            });

    }, [search, page]);

    const totalPages = Math.ceil(totalIssues / limit);

    const handleConfirmReturn = async (issueId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `${API_BASE_URL}/issues/confirm-return/${issueId}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Could not confirm return"
                );
            }

            alert("Book return confirmed successfully!");

            const updatedResponse = await fetch(
                `${API_BASE_URL}/issues/all?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (!updatedResponse.ok) {
                throw new Error("Could not refresh issues");
            }

            const updatedData = await updatedResponse.json();

            setIssues(updatedData.issues);
            setTotalIssues(updatedData.total);

        } catch (error) {
            console.error("Error confirming return:", error);
            alert(error.message || "Failed to confirm return.");
        }
    };

    return (
        <>
            <Navheader />

            <div className="issues-page">

                <div className="issues-header">
                    <div>
                        <h1>All Issues</h1>
                        <p>View all borrowed books and their status.</p>
                    </div>
                </div>

                <div className="issues-search">
                    <input
                        type="text"
                        placeholder="Search by user name, book name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <button>Search</button>
                </div>

                <table className="issues-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Book Name</th>
                            <th>Issued On</th>
                            <th>Due Date</th>
                            <th>Returned On</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {issues.map((issue) => (

                            <tr key={issue.issue_id}>

                                <td>{issue.issue_id}</td>

                                <td>{issue.user_name}</td>

                                <td>{issue.book_name}</td>

                                <td>
                                    {issue.issued_at
                                        ? new Date(issue.issued_at).toLocaleDateString()
                                        : "-"
                                    }
                                </td>

                                <td>
                                    {issue.due_date
                                        ? new Date(issue.due_date).toLocaleDateString()
                                        : "-"
                                    }
                                </td>

                                <td>
                                    {issue.returned_at
                                        ? new Date(issue.returned_at).toLocaleDateString()
                                        : "-"
                                    }
                                </td>

                                <td>
                                    <span
                                        className={
                                            issue.returned_at
                                                ? "issue-status returned"
                                                : "issue-status borrowed"
                                        }
                                    >
                                        {issue.returned_at
                                            ? "Returned"
                                            : issue.return_requested
                                                ? "Return Requested"
                                                : "Borrowed"
                                        }
                                    </span>
                                </td>

                                <td>
                                    {issue.return_requested && !issue.returned_at ? (
                                        <button
                                            onClick={() =>
                                                handleConfirmReturn(issue.issue_id)
                                            }
                                        >
                                            Confirm Return
                                        </button>
                                    ) : issue.returned_at ? (
                                        "Completed"
                                    ) : (
                                        "-"
                                    )}
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
