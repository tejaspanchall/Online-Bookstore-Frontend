import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BookDetail() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [editedBook, setEditedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const fetchBook = async () => {
    try {
      const res = await fetch(
        `${BACKEND}/books/get-books.php?id=${id}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch book");
      }

      const data = await res.json();
      setBook(data);
      setEditedBook({ ...data });
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibraryStatus = async () => {
    try {
      const res = await fetch(
        `${BACKEND}/books/get-library.php`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        const libraryBooks = await res.json();
        if (Array.isArray(libraryBooks)) {
          setInLibrary(
            libraryBooks.some(
              (b) => parseInt(b.id, 10) === parseInt(id, 10)
            )
          );
        }
      }
    } catch (error) {
      console.error("Library status error:", error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book) {
      fetchLibraryStatus();
    }
  }, [book, id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedBook({ ...book });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBook((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const requiredFields = ['title', 'author', 'isbn', 'description', 'image'];
      const missingFields = requiredFields.filter(field => !editedBook[field]?.trim());
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      const res = await fetch(
        `${BACKEND}/books/update-book.php`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editedBook.id,
            title: editedBook.title.trim(),
            image: editedBook.image.trim(),
            description: editedBook.description.trim(),
            isbn: editedBook.isbn.trim(),
            author: editedBook.author.trim(),
          }),
        }
      );
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update book");
      }
  
      setBook(editedBook);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddToLibrary = async () => {
    try {
      const res = await fetch(
        `${BACKEND}/books/my-library.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            image: book.image,
            description: book.description,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add book to library");
      }

      setInLibrary(true);
    } catch (error) {
      console.error("Add error:", error);
      setError(error.message);
    }
  };

  const handleRemoveFromLibrary = async () => {
    try {
      const res = await fetch(
        `${BACKEND}/books/remove-from-library.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: book.id }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to remove book from library"
        );
      }
      setInLibrary(false);
    } catch (error) {
      console.error("Remove error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const res = await fetch(
          `${BACKEND}/books/delete-book.php`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: book.id }),
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete book");
        }
        navigate("/catalog");
      } catch (error) {
        console.error("Delete error:", error);
        setError(error.message);
      }
    }
  };

  if (isLoading) return <div className="container py-5">Loading...</div>;
  if (error)
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  if (!book) return <div className="container py-5">Book not found</div>;

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <img
            src={book.image || "https://via.placeholder.com/200x300?text=Book+Cover"}
            alt={book.title}
            className="img-fluid rounded-3 shadow-sm"
            style={{
              maxHeight: "100%",
              width: "300px",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="col-md-8">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                name="title"
                className="form-control mb-2"
                value={editedBook.title}
                onChange={handleInputChange}
                placeholder="Book Title"
              />
              <input
                type="text"
                name="author"
                className="form-control mb-2"
                value={editedBook.author}
                onChange={handleInputChange}
                placeholder="Author"
              />
              <input
                type="text"
                name="isbn"
                className="form-control mb-2"
                value={editedBook.isbn}
                onChange={handleInputChange}
                placeholder="ISBN"
              />
              <input
                type="url"
                name="image"
                className="form-control mb-2"
                value={editedBook.image}
                onChange={handleInputChange}
                placeholder="Image URL"
              />
              <textarea
                name="description"
                className="form-control mb-3"
                value={editedBook.description}
                onChange={handleInputChange}
                placeholder="Book Description"
                rows="4"
              />
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={handleSaveEdit}>
                  Save Changes
                </button>
                <button className="btn btn-secondary" onClick={handleEditToggle}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="fw-bold mb-3">{book.title}</h3>
              <div className="d-flex gap-2 mb-3">
                <span className="badge bg-primary">{book.author}</span>
                <span className="badge bg-secondary">ISBN: {book.isbn}</span>
              </div>
              <p className="mb-4" style={{ maxHeight: "150px", overflowY: "auto" }}>
                {book.description}
              </p>
              <div className="d-flex gap-2">
                {inLibrary ? (
                  <button className="btn btn-warning" onClick={handleRemoveFromLibrary}>
                    Remove from Library
                  </button>
                ) : (
                  <button className="btn btn-success" onClick={handleAddToLibrary}>
                    Add to Library
                  </button>
                )}
                
                {userRole === 'teacher' && (
                  <>
                    <button className="btn btn-primary" onClick={handleEditToggle}>
                      Edit Book
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                      Delete Book
                    </button>
                  </>
                )}
                
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Back to Catalog
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}