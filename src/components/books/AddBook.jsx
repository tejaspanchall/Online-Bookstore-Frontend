import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';

export default function AddBook() {
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: '',
    image: null,
    description: '',
    isbn: '',
    author: '',
  });
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const sessionResponse = await fetch(
          'https://online-bookstore-backend-production.up.railway.app/auth/validate-session.php',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!sessionResponse.ok) {
          navigate('/login');
          return;
        }

        const data = await sessionResponse.json();
        
        if (data.status === 'valid' && data.user) {
          if (data.user.role === 'teacher') {
            setIsAuthorized(true);
          } else {
            navigate('/');
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setMessage('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
        return;
      }
      
      setBook(prev => ({
        ...prev,
        image: file,
      }));
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', book.title.trim());
    formData.append('description', book.description.trim());
    formData.append('isbn', book.isbn.trim());
    formData.append('author', book.author.trim());

    if (book.image) {
      formData.append('image', book.image);
    }

    try {
      const response = await fetch(
        'https://online-bookstore-backend-production.up.railway.app/books/add.php',
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add book');
      }

      setMessage('Book added successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error details:', error);
      setMessage(error.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="d-flex justify-content-center p-5">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthForm
      onSubmit={handleSubmit}
      title="Add New Book"
      footerLink={{ to: '/', text: 'Back to Home' }}
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
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
        <small className="text-muted">Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</small>
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
      <button 
        type="submit" 
        className="btn btn-primary w-100 py-2"
        disabled={isLoading}
      >
        {isLoading ? 'Adding Book...' : 'Add Book'}
      </button>
      {message && (
        <div className={`mt-3 alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
    </AuthForm>
  );
}