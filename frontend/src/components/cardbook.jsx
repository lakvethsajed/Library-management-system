import "./cardbook.css";

export default function CardBook(props) {
    return (
        <article className="cardbook">
            <img src={props.img} alt={props.alt} />
            <h3>{props.name}</h3>
            <p className="author">{props.author}</p>
            <p className="description">{props.Description}</p>
            <p className="genre">{props.genre}</p>
        </article>
    );
}