import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "./BookCard";
import Pagination from "./Pagination";

export default function MyLibrary() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const BOOKS_PER_PAGE = 10;

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://via.placeholder.com/200x300?text=Book+Cover";
    }
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const updateDisplayedBooks = (books, page) => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    const booksToDisplay = books.slice(startIndex, endIndex);
    setDisplayedBooks(booksToDisplay);
    setCurrentPage(page);
    setTotalPages(Math.ceil(books.length / BOOKS_PER_PAGE));
  };

  useEffect(() => {
    const fetchMyLibrary = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate("/login");
          return;
        }
        
        const response = await fetch(`${BACKEND}/books/get-library.php`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch library');
        }

        if (data.status === 'error') {
          throw new Error(data.message);
        }

        const books = data.data || [];
        setAllBooks(books);
        updateDisplayedBooks(books, 1);
      } catch (error) {
        console.error("Fetch error:", error);
        if (error.message.includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate("/login");
          return;
        }
        setError(error.message || "Failed to fetch library. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyLibrary();
  }, [BACKEND, navigate]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <div className="d-flex flex-column align-items-center">
            <p className="mb-3">{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Library</h2>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Browse More Books
        </button>
      </div>

      {allBooks.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-4">Your library is empty</p>
          <div className="d-flex justify-content-center">
            <button className="btn btn-lg btn-primary" onClick={() => navigate("/")}>
              Discover Books
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-4">
            {displayedBooks.map((book) => (
              <div className="col" key={book.id}>
                <BookCard
                  book={book}
                  onClick={() => navigate(`/book/${book.id}`)}
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