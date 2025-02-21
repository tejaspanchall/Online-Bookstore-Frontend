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
    setIsLoading(true);
    try {
      let url = `${BACKEND}/books/search.php`;
      if (search) {
        url += `?q=${encodeURIComponent(search)}`;
      }
      
      console.log("Fetching from URL:", url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("API Response:", data);
      
      const books = Array.isArray(data) ? data : [];
      const filteredBooks = applyFilter(books);
      setAllBooks(filteredBooks);

      const total = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
      setTotalPages(total || 1);

      updateDisplayedBooks(filteredBooks, 1);
      setMessage("");
    } catch (error) {
      console.error("Fetch error details:", error);
      setMessage(`Search failed: ${error.message}`);
      setAllBooks([]);
      setDisplayedBooks([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDisplayedBooks = (books, page) => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    setDisplayedBooks(books.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchBooks().catch(err => {
        console.error("Initial load error:", err);
        setMessage("Could not load books. Please check your API configuration.");
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const filteredBooks = applyFilter(allBooks);
    updateDisplayedBooks(filteredBooks, 1);
    setTotalPages(Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1);
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
            <button 
              onClick={searchBooks} 
              className="btn btn-primary px-4"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
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
                      onClick={(e) => {
                        e.preventDefault();
                        setFilter("asc");
                      }}
                    >
                      A-Z
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setFilter("desc");
                      }}
                    >
                      Z-A
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setFilter("recent");
                      }}
                    >
                      Recently Added
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setFilter("last");
                      }}
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

      {isLoading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : displayedBooks.length === 0 ? (
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