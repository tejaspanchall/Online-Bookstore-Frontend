import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';
import { AuthContext } from '../context/AuthContext';

export default function AddBook() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const { token, isTeacher } = useContext(AuthContext);
  
  const [book, setBook] = useState({
    title: '',
    image: '',
    description: '',
    isbn: '',
    author: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);
    
    try {
      if (!token || !isTeacher()) {
        throw new Error('Only teachers can add books');
      }

      const requiredFields = ['title', 'image', 'description', 'isbn', 'author'];
      for (const field of requiredFields) {
        if (!book[field] || !book[field].trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }

      try {
        new URL(book.image);
      } catch {
        throw new Error('Please enter a valid image URL');
      }
      
      const res = await fetch(`${BACKEND}/books/add.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: book.title.trim(),
          image: book.image.trim(),
          description: book.description.trim(),
          isbn: book.isbn.trim(),
          author: book.author.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add book');
      }

      const data = await res.json();
      setMessage('Book added successfully!');
      setIsError(false);
      setTimeout(() => navigate('/catalog'), 1500);
    } catch (error) {
      setMessage(error.message || 'Failed to connect to server');
      setIsError(true);
    } finally {
      setIsLoading(false);
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
          className="w-full p-2 bg-white rounded border focus:outline-none"
          style={{ 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
          }}
          placeholder="Title"
          value={book.title}
          onChange={(e) => setBook({ ...book, title: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="url"
          className="w-full p-2 bg-white rounded border focus:outline-none"
          style={{ 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
          }}
          placeholder="Image URL"
          value={book.image}
          onChange={(e) => setBook({ ...book, image: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          className="w-full p-2 bg-white rounded border focus:outline-none"
          style={{ 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
          }}
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
          className="w-full p-2 bg-white rounded border focus:outline-none"
          style={{ 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
          }}
          placeholder="ISBN"
          value={book.isbn}
          onChange={(e) => setBook({ ...book, isbn: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="w-full p-2 bg-white rounded border focus:outline-none"
          style={{ 
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
          }}
          placeholder="Author"
          value={book.author}
          onChange={(e) => setBook({ ...book, author: e.target.value })}
          required
        />
      </div>
      <button 
        type="submit" 
        className="w-full py-2 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: isLoading ? 'var(--color-text-light)' : 'var(--color-button-primary)',
          color: 'var(--color-bg-primary)', 
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-hover)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary)'}
        disabled={isLoading}
      >
        {isLoading ? 'Adding Book...' : 'Add Book'}
      </button>
      {message && (
        <div className={`mt-3 p-3 rounded ${isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}
    </AuthForm>
  );
}