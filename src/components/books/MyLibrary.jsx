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
        <div className="flex justify-center items-center min-h-[200px]">
          <div 
            className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{ 
              borderColor: 'var(--color-border)',
              borderTopColor: 'var(--color-primary)'
            }}
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="p-4 bg-red-100 border border-red-200 rounded" role="alert">
          <div className="flex flex-col items-center">
            <p className="mb-3 text-red-700">{error}</p>
            <button 
              className="px-4 py-2 rounded transition duration-300"
              style={{ 
                backgroundColor: 'var(--color-button-primary)',
                color: 'var(--color-bg-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
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
      <div className="flex justify-between items-center mb-4">
        <h2 
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          My Library
        </h2>
        <button 
          className="px-4 py-2 rounded transition duration-300"
          style={{ 
            backgroundColor: 'var(--color-button-primary)',
            color: 'var(--color-bg-primary)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
          onClick={() => navigate("/")}
        >
          Browse More Books
        </button>
      </div>

      {allBooks.length === 0 ? (
        <div className="text-center py-5">
          <p style={{ color: 'var(--color-text-light)' }} className="mb-4">Your library is empty</p>
          <div className="flex justify-center">
            <button 
              className="px-6 py-3 text-lg rounded transition duration-300"
              style={{ 
                backgroundColor: 'var(--color-button-primary)',
                color: 'var(--color-bg-primary)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
              onClick={() => navigate("/")}
            >
              Discover Books
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-10">
            {displayedBooks.map((book) => (
              <div key={book.id}>
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