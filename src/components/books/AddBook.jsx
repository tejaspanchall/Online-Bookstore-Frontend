import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';

export default function AddBook() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: '',
    image: null,
    description: '',
    isbn: '',
    author: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setBook(prev => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    
    const formData = new FormData();

    formData.append('title', book.title);
    formData.append('description', book.description);
    formData.append('isbn', book.isbn);
    formData.append('author', book.author);

    if (book.image) {
      formData.append('image', book.image);
    }

    try {
      const res = await fetch(
        `${BACKEND}/books/add.php`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add book');
      }

      setMessage('Book added successfully!');
      setIsError(false);
      // Wait a moment before redirecting
      setTimeout(() => navigate('/catalog'), 1500);
    } catch (error) {
      console.error('Error details:', error);
      setMessage(error.message || 'Failed to connect to server');
      setIsError(true);
    }
  };

  return (
    <AuthForm
      onSubmit={handleSubmit}
      title="Add New Book"
      footerLink={{ to: '/catalog', text: 'Back to Catalog' }}
    >
      <div className="mb-3">
        <input
          type="text"
          className="form-control bg-dark text-white"
          placeholder="Title"
          value={book.title}
          onChange={(e) => setBook({ ...book, title: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="file"
          className="form-control bg-dark text-white"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      <div className="mb-3">
        <textarea
          className="form-control bg-dark text-white"
          placeholder="Description"
          value={book.description}
          onChange={(e) => setBook({ ...book, description: e.target.value })}
          required
          rows="4"
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control bg-dark text-white"
          placeholder="ISBN"
          value={book.isbn}
          onChange={(e) => setBook({ ...book, isbn: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control bg-dark text-white"
          placeholder="Author"
          value={book.author}
          onChange={(e) => setBook({ ...book, author: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-100 py-2">
        Add Book
      </button>
      {message && (
        <div className={`mt-3 alert ${isError ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}
    </AuthForm>
  );
}