import React from "react";

const BookCard = ({ book, onClick, getImageUrl }) => {
  return (
    <div
      className="book-card card h-100 border-0 overflow-hidden"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="position-relative">
        <img
          src={getImageUrl(book.image)}
          alt={book.title}
          className="card-img-top"
          loading="lazy"
          style={{ height: "250px", objectFit: "cover" }}
        />
        <div className="badge bg-primary position-absolute top-0 end-0 m-2">
          {book.author}
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title">{book.title}</h5>
      </div>
    </div>
  );
};

export default BookCard;
