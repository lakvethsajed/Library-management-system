import Logo from "../assets/Logo.jpg";
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { SlUser } from "react-icons/sl";

export default function NavHeader() {
    const navigate = useNavigate();
    const [isloggedin, setisloggedin] = React.useState(
        !!localStorage.getItem("token")
    );
    const [user, setUser] = React.useState(null);
    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        async function getUser() {
            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/users/me",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log("Failed to get user:", error);
                setUser(null);
            }
        }

        getUser();
    }, [isloggedin]);

    async function handleLogout() {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                await fetch("http://127.0.0.1:8000/logout", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.log("Logout request failed:", error);
            }
        }

        localStorage.removeItem("token");
        setUser(null);
        setisloggedin(false);
        navigate("/");
    }

    return (
        <header className="header">
            <nav className="nav">
                <div className="nav-main">
                    <div className="navlinks">
                        <Link to="/">
                            <img src={Logo} alt="Logo" />
                        </Link>

                        <span className="nav-title">
                            Library
                        </span>
                    </div>
                    <ul className="nav-left">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/books">Books</Link></li>
                        {user?.role === "admin" ? (
                            <>
                                <li><Link to="/manage">Manage Books</Link></li>
                                <li><Link to="/users">Users</Link></li>
                                <li><Link to="/issues">Issues</Link></li>
                            </>
                        ) : isloggedin ? (
                            <>
                                <li><Link to="/my-books">My Books</Link></li>
                            </>
                        ) : null}

                    </ul>

                </div>
                <div className="auth-links">
                    {isloggedin ? (
                        <>
                        <Link to="/get-user" id="current-user"><SlUser /></Link>
                        <button onClick={handleLogout} id="logout">Logout</button>

                        </>
                    ) : (

                        <>
                        <Link to="/login" id="login">Login</Link>
                        <Link to="/register" id="create-account">Create Account</Link>
                        </>

                    )}

                </div>

            </nav>
        </header>
    );
}