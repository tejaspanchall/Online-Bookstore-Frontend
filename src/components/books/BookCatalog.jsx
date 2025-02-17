import { Search } from "react-bootstrap-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "./BookCard";
import Pagination from "./Pagination";

export default function BookCatalog() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);
  const BOOKS_PER_PAGE = 10;

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/200x300?text=Book+Cover";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const applyFilter = (books) => {
    switch (filter) {
      case "asc":
        return [...books].sort((a, b) => a.title.localeCompare(b.title));
      case "desc":
        return [...books].sort((a, b) => b.title.localeCompare(a.title));
      case "recent":
        return [...books].sort((a, b) => b.id - a.id);
      case "last":
        return [...books].sort((a, b) => a.id - b.id);
      default:
        return books;
    }
  };

  const searchBooks = async () => {
    try {
      const res = await fetch(
        `https://online-bookstore-backend-production.up.railway.app/books/search.php?q=${search}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      const books = Array.isArray(data) ? data : data.books || [];
      const filteredBooks = applyFilter(books);
      setAllBooks(filteredBooks);

      const total = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
      setTotalPages(total);

      updateDisplayedBooks(filteredBooks, 1);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Search failed");
      setAllBooks([]);
      setDisplayedBooks([]);
      setTotalPages(1);
    }
  };

  const updateDisplayedBooks = (books, page) => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    setDisplayedBooks(books.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  useEffect(() => {
    searchBooks();
  }, []);

  useEffect(() => {
    const filteredBooks = applyFilter(allBooks);
    setDisplayedBooks(filteredBooks.slice(0, BOOKS_PER_PAGE));
    setTotalPages(Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));
  }, [filter]);

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="input-group input-group-lg">
            <span className="input-group-text bg-dark border-dark">
              <Search />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchBooks()}
            />
            <button onClick={searchBooks} className="btn btn-primary px-4">
              Search
            </button>

            <div className="ms-3">
              <div className="dropdown">
                <button
                  className="btn btn-primary dropdown-toggle px-4 h-12"
                  type="button"
                  id="filterDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ height: "50px" }}
                >
                  Filter
                </button>
                <ul className="dropdown-menu" aria-labelledby="filterDropdown">
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setFilter("asc")}
                    >
                      A-Z
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setFilter("desc")}
                    >
                      Z-A
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setFilter("recent")}
                    >
                      Recently Added
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setFilter("last")}
                    >
                      Last Added
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${
            message.includes("success") ? "alert-success" : "alert-danger"
          } mb-4`}
        >
          {message}
        </div>
      )}

      {displayedBooks.length === 0 ? (
        <div className="text-center mt-4">
          <p className="text-muted">No books found</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-4">
            {displayedBooks.map((book) => (
              <div className="col" key={book.id}>
                <BookCard
                  book={book}
                  onClick={() => handleBookClick(book.id)}
                  getImageUrl={getImageUrl}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateDisplayedBooks(allBooks, page)}
            />
          )}
        </>
      )}
    </div>
  );
}
