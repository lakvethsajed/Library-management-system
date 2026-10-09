import "./display.css"
import lib3 from "../assets/lib3.jpg"
export default function Display() {
    return(
        <section className="display">
            <div className="display-content">
                <p className="welcome-message">Welcome to Library</p>
                <h1 className="library-title">This is Your Personal Library</h1>
                <p className="library-description">Discover a world of knowledge and imagination with our extensive collection of books. Whether you're a casual reader or a dedicated bookworm, our library offers something for everyone. Explore new genres, find your next favorite author, and immerse yourself in captivating stories. Start your literary journey today!</p>
                <div className="stats-container">
                    <div className="stat">
                        <h3>100+</h3>
                        <p>Books</p>
                    </div>
                    <div className="stat">
                        <h3>10+</h3>
                        <p>Members</p>
                    </div>
                    <div className="stat">
                        <h3>10+</h3>
                        <p>Genres</p>
                    </div>
                </div>
            </div>
            <div className="display-image">
                <img src={lib3} alt="Library Image"/>
            </div>
        </section>
    )
}