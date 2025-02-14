import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [editedBook, setEditedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const fetchBook = async () => {
    try {
      const res = await fetch(
        `https://backend-production-5a9b.up.railway.app/api/books/get-books.php?id=${id}`,
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
        "https://backend-production-5a9b.up.railway.app/api/books/get-library.php",
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

  const fetchUserRole = async () => {
    try {
      const res = await fetch('https://backend-production-5a9b.up.railway.app/api/auth/get-role.php', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/200x300?text=Book+Cover";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (book) {
      fetchLibraryStatus();
    }
  }, [book, id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setNewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBook((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
  };

  const handleSaveEdit = async () => {
    const formData = new FormData();

    formData.append("id", editedBook.id);
    formData.append("title", editedBook.title);
    formData.append("author", editedBook.author);
    formData.append("isbn", editedBook.isbn);
    formData.append("description", editedBook.description);

    if (newImage) {
      formData.append("image", newImage);
    }

    try {
      const res = await fetch(
        "https://backend-production-5a9b.up.railway.app/api/books/update-book.php",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update book");
      }

      const updatedData = await res.json();
      setBook({
        ...editedBook,
        image: updatedData.image_path || editedBook.image,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message);
    }
  };

  const handleAddToLibrary = async () => {
    try {
      const res = await fetch(
        "https://backend-production-5a9b.up.railway.app/api/books/my-library.php",
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
        "https://backend-production-5a9b.up.railway.app/api/books/remove-from-library.php",
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
          "https://backend-production-5a9b.up.railway.app/api/books/delete-book.php",
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

  if (isLoading)
    return <div className="container py-5">Loading...</div>;
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
          {isEditing ? (
            <div>
              <input
                type="file"
                className="form-control mb-2"
                onChange={handleImageChange}
                accept="image/*"
              />
              <img
                src={
                  newImage
                    ? URL.createObjectURL(newImage)
                    : getImageUrl(book.image)
                }
                alt={book.title}
                className="img-fluid rounded-3 shadow-sm"
                loading="lazy"
                style={{
                  maxHeight: "300px",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : (
            <img
              src={getImageUrl(book.image)}
              alt={book.title}
              className="img-fluid rounded-3 shadow-sm"
              loading="lazy"
              style={{
                maxHeight: "100%",
                width: "300px",
                objectFit: "cover",
              }}
            />
          )}
        </div>
        <div className="col-md-8">
          {isEditing ? (
            <>
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
              <textarea
                name="description"
                className="form-control mb-2"
                value={editedBook.description}
                onChange={handleInputChange}
                placeholder="Book Description"
                rows="4"
              />
            </>
          ) : (
            <>
              <h3 className="fw-bold mb-3">{book.title}</h3>
              <div className="d-flex gap-2 mb-3">
                <span className="badge bg-primary">{book.author}</span>
                <span className="badge bg-secondary">ISBN: {book.isbn}</span>
              </div>
              <p
                className="mb-4"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                {book.description}
              </p>
            </>
          )}

          <div className="d-flex gap-2">
            {isEditing ? (
              <>
                <button className="btn btn-success" onClick={handleSaveEdit}>
                  Save Changes
                </button>
                <button className="btn btn-secondary" onClick={handleEditToggle}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                {inLibrary ? (
                  <button
                    className="btn btn-warning"
                    onClick={handleRemoveFromLibrary}
                  >
                    Remove from Library
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={handleAddToLibrary}
                  >
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
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(-1)}
                >
                  Back to Catalog
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}