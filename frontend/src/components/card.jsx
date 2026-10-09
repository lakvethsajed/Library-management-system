import "./card.css"
import book2 from "../assets/book2.jpg";
import book3 from "../assets/book3.jpg";
import book4 from "../assets/book4.jpg";
import book5 from "../assets/book5.jpg";
import book1 from "../assets/book1.jpg";
import book6 from "../assets/book6.jpg";
import CardBook from "./cardbook";
export default function Card() {
    return(
    <section>
        <div className="card">
            <p>FEATURED BOOKS</p>
            <h2>Popular Books</h2>
            <p>Check out our some of the popular books!</p>
        </div>
        <div className="books-container">
        <CardBook img={book1} alt="Book 1"  name="Dune" author="Frank Herbert" Description="A science fiction novel set in the fictional world of Arrakis." genre="Sci-Fi"/>
        <CardBook img={book2} alt="Book 2"  name="The Lord of the Rings" author="J.R.R. Tolkein" Description="A fantasy novel set in the fictional world of Middle-earth." genre="Fantasy"/>
        <CardBook img={book3} alt="Book 3" name="Harry Potter" author="J.K. Rowling" Description="A series of fantasy novels dealing with the adventures of a young wizard." genre="Fantasy"/>
        <CardBook img={book4} alt="Book 4" name="Animal Farm" author="George Orwell" Description="A dystopian social science fiction novel." genre="Dystopian"/>
        <CardBook img={book5} alt="Book 5" name="Pride and Prejudice" author="Jane Austen" Description="A romantic novel of manners." genre="Romance"/>
        <CardBook img={book6} alt="Book 6" name="To Kill a mockingbird" author="Harper Lee" Description="A gripping tale of racial injustice and childhood innocence." genre="Fiction"/>
       </div>
    </section>
    )}