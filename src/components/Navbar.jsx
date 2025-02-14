import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PersonFill, JournalBookmark, PlusCircle } from 'react-bootstrap-icons';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = async () => {
    try {
      const sessionResponse = await fetch(
        'https://online-bookstore-backend-production.up.railway.app/auth/validate-session.php',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!sessionResponse.ok) {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const data = await sessionResponse.json();
      
      if (data.status === 'valid' && data.user) {
        setIsLoggedIn(true);
        setUserRole(data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      validateSession();
    };

    window.addEventListener('loginStateChange', handleAuthChange);
    return () => window.removeEventListener('loginStateChange', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        'https://online-bookstore-backend-production.up.railway.app/auth/logout.php',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.ok) {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
        window.dispatchEvent(new Event('loginStateChange'));
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar py-3">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-4">
            <JournalBookmark className="me-2" />
            BookCafe
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar py-3">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold fs-4">
          <JournalBookmark className="me-2" />
          BookCafe
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <NavLink 
                    to="/my-library" 
                    className="nav-link d-flex align-items-center gap-1"
                  >
                    <PersonFill /> My Library
                  </NavLink>
                </li>
                {userRole === 'teacher' && (
                  <li className="nav-item">
                    <NavLink 
                      to="/add-book" 
                      className="btn btn-primary d-flex align-items-center gap-1"
                    >
                      <PlusCircle /> Add Book
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-link nav-link text-danger"
                    style={{ cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="btn btn-primary">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}