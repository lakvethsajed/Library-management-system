import { BookOpen, Search, UsersRound, Clock3 } from "lucide-react";
import "./footer.css";

export default function Footer() {
    return (
        <section className="footer">

            <p className="footer-p">WHY CHOOSE OUR LIBRARY?</p>

            <h2>More Than Just Books</h2>

            <div className="footer-container">

                <div className="footer-card">
                    <div className="footer-icon">
                        <BookOpen />
                    </div>

                    <h3>Wide Collection</h3>

                    <p>
                        Explore hundreds of books<br />
                        across various genres.
                    </p>
                </div>


                <div className="footer-card">
                    <div className="footer-icon">
                        <Search />
                    </div>

                    <h3>Easy Search</h3>

                    <p>
                        Find your favorite books<br />
                        quickly and easily.
                    </p>
                </div>


                <div className="footer-card">
                    <div className="footer-icon">
                        <UsersRound />
                    </div>

                    <h3>User Friendly</h3>

                    <p>
                        Simple and clean interface<br />
                        for a better experience.
                    </p>
                </div>


                <div className="footer-card">
                    <div className="footer-icon">
                        <Clock3 />
                    </div>

                    <h3>Track Your Books</h3>

                    <p>
                        Keep track of your borrowed<br />
                        books and due dates.
                    </p>
                </div>

            </div>

        </section>
    );
}