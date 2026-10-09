import NavHeader from "../components/navbar";
import "./getuser.css"
import { useNavigate } from "react-router-dom"
import React from "react"
import {
    UserRound,
    ShieldCheck,
    AtSign,
    Mail,
} from "lucide-react";
import { CiCircleChevLeft } from "react-icons/ci";

export default function GetUser(){
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

const token = localStorage.getItem("token");

React.useEffect(() => {
    if (!token) {
        navigate("/login");
        return;
    }
    const fetchUser = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/users/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch user details.");
            }

            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    fetchUser();
}, [token, navigate]);
    return (
        <>
        <NavHeader />
            <main className="get-user-page">
                <button className="get-user-back-button" onClick={() => navigate(-1)} type="button">   
                    <CiCircleChevLeft />
                    Back
                </button>
                <header className="get-user-heading">
                    <div className="get-user-avatar">
                        <UserRound />
                    </div>
                    <div>
                        <h1>My Profile</h1>
                        <p>View your account information and personal details.</p>
                    </div>
                </header>
                {loading ? (
                    <section className="get-user-card">
                        <p>Loading your profile...</p>
                    </section>
                ) : error ? (
                    <section className="get-user-card">
                        <p>{error}</p>
                    </section>
                ) : user ? (
                    <section className="get-user-card">
                        <div className="get-user-card-heading">
                            <div>
                                <span className="get-user-eyebrow">ACCOUNT DETAILS</span>
                                <h2>{user.name || user.username || "Library User"}</h2>
                                <p>Your registered profile information</p>
                            </div>
                            <span className="get-user-role">
                                <ShieldCheck />
                                {user.role || "User"}
                            </span>
                        </div>

                        <div className="get-user-divider" />

                        <div className="get-user-details-grid">
                            <div className="get-user-detail">
                                <span className="get-user-detail-icon">
                                    <UserRound />
                                </span>
                                <div>
                                    <span className="get-user-label">Full Name</span>
                                    <strong>{user.name || "Not available"}</strong>
                                </div>
                            </div>

                            <div className="get-user-detail">
                                <span className="get-user-detail-icon">
                                    <AtSign />
                                </span>
                                <div>
                                    <span className="get-user-label">Username</span>
                                    <strong>{user.username || "Not available"}</strong>
                                </div>
                            </div>

                            <div className="get-user-detail">
                                <span className="get-user-detail-icon">
                                    <Mail />
                                </span>
                                <div>
                                    <span className="get-user-label">Email Address</span>
                                    <strong>{user.email || "Not available"}</strong>
                                </div>
                            </div>

                            <div className="get-user-detail">
                                <span className="get-user-detail-icon">
                                    <ShieldCheck />
                                </span>
                                <div>
                                    <span className="get-user-label">Account Role</span>
                                    <strong className="get-user-role-text">
                                        {user.role || "Not available"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : null}
            </main>
        </>
    );}