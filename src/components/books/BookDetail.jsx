import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function BookDetail() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, isAuthenticated, isTeacher, logout } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || null);

  const fetchBook = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BACKEND}/books/get-books.php?id=${id}`, {
        credentials: "include",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch book");
      }

      const text = await res.text();
      let data;

      try {
        data = text.trim() ? JSON.parse(text) : null;
      } catch (e) {
        throw new Error("Invalid response format from server");
      }

      if (!data) {
        throw new Error("No data received from server");
      }

      setBook(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibraryStatus = async () => {
    if (!isAuthenticated() || !token) {
      setInLibrary(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/books/get-library.php`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.status === 401) {
        setInLibrary(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch library status (${res.status})`);
      }

      const response = await res.json();

      if (response.status === "success" && Array.isArray(response.data)) {
        const hasBook = response.data.some((book) => parseInt(book.id) === parseInt(id));
        setInLibrary(hasBook);
      } else {
        setInLibrary(false);
      }
    } catch (error) {
      console.error("Library status error:", error);
      setInLibrary(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book && isAuthenticated()) {
      fetchLibraryStatus();
    }
  }, [book, id, token, isAuthenticated]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleAddToLibrary = async () => {
    try {
      if (!isAuthenticated() || !token) {
        throw new Error("You must be logged in to add books to your library");
      }

      const res = await fetch(`${BACKEND}/books/my-library.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: book.id,
          isbn: book.isbn || "N/A",
          title: book.title || "",
          author: book.author || "",
          image: book.image || "",
          description: book.description || "",
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to add book to library");
      }

      setInLibrary(true);
      setSuccessMessage(responseData.message || "Book added to your library successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);

      fetchLibraryStatus();
    } catch (error) {
      console.error("Add to library error:", error);
      setError(error.message);
    }
  };

  const handleRemoveFromLibrary = async () => {
    try {
      if (!isAuthenticated() || !token) {
        throw new Error("Authentication required");
      }

      const res = await fetch(`${BACKEND}/books/remove-from-library.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: book.id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove book from library");
      }

      setInLibrary(false);
      setSuccessMessage("Book removed from your library");
      setTimeout(() => setSuccessMessage(null), 3000);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      setIsDeleting(true);

      if (!isAuthenticated() || !isTeacher()) {
        throw new Error("You must be logged in as a teacher to delete books");
      }

      const res = await fetch(`${BACKEND}/books/delete-book.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: book.id }),
      });

      if (res.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      } else if (res.status === 403) {
        throw new Error("You don't have permission to delete books.");
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Failed to delete book");
      }

      setSuccessMessage("Book deleted successfully");
      setTimeout(() => {
        navigate("/catalog");
      }, 1500);
    } catch (error) {
      setError(error.message);
      if (error.message.includes("session has expired")) {
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <div className="container mx-auto py-12" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        <div className="p-4 rounded-lg" role="alert" style={{ backgroundColor: "rgba(var(--color-accent), 0.2)", color: "var(--color-text-light)" }}>
          Error: {error}
        </div>
      </div>
    );
  if (!book)
    return (
      <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
        Book not found
      </div>
    );

  return (
    <div className="container mx-auto py-12 px-4" style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      {successMessage && (
        <div className="p-4 rounded-lg mb-6" role="alert" style={{ backgroundColor: "var(--color-text-secondary)", color: "var(--color-bg-primary)", borderColor: "var(--color-primary)" }}>
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 lg:w-1/4">
          <img
            src={book.image || "https://via.placeholder.com/200x300?text=Book+Cover"}
            alt={book.title}
            className="w-full rounded-lg shadow-md"
            style={{ maxHeight: "100%", maxWidth: "300px", objectFit: "cover" }}
          />
        </div>
        <div className="md:w-2/3 lg:w-3/4">
          <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
            {book.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-bg-primary)" }}>
              {book.author}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-button-primary)", color: "var(--color-bg-primary)" }}>
              ISBN: {book.isbn}
            </span>
          </div>
          <div className="mb-6 max-h-40 overflow-y-auto pr-2" style={{ color: "var(--color-text-secondary)" }}>
            <p>{book.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAuthenticated() && (
              <>
                {inLibrary ? (
                  <button
                    className="px-4 py-2 font-medium rounded-lg transition duration-200"
                    onClick={handleRemoveFromLibrary}
                    style={{ backgroundColor: "green", color: "var(--color-bg-primary)" }}
                  >
                    Remove from Library
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 font-medium rounded-lg transition duration-200"
                    onClick={handleAddToLibrary}
                    style={{ backgroundColor: "green", color: "var(--color-bg-primary)" }}
                  >
                    Add to Library
                  </button>
                )}
              </>
            )}

            {isAuthenticated() && isTeacher() && (
              <>
                <button
                  className="px-4 py-2 font-medium rounded-lg transition duration-200"
                  onClick={() => navigate(`/book/${book.id}/edit`)}
                  style={{ backgroundColor: "yellow", color: "var(--color-text-primary)" }}
                >
                  Edit Book
                </button>
                <button
                  className="px-4 py-2 font-medium rounded-lg transition duration-200 disabled:opacity-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{ backgroundColor: "red", color: "var(--color-bg-primary)" }}
                >
                  {isDeleting ? "Deleting..." : "Delete Book"}
                </button>
              </>
            )}

            <button
              className="px-4 py-2 font-medium rounded-lg transition duration-200"
              onClick={() => navigate(-1)}
              style={{ backgroundColor: "var(--color-bg-primary)", borderColor: "var(--color-border)", borderWidth: "1px", color: "var(--color-text-primary)" }}
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}