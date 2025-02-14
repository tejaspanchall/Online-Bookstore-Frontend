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
      // First validate the session
      const sessionResponse = await fetch(
        'https://online-bookstore-backend-production.up.railway.app/auth/validate-session.php',
        {
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

      // If session is valid, get the user role
      const roleResponse = await fetch(
        'https://online-bookstore-backend-production.up.railway.app/auth/get-role.php',
        {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (roleResponse.ok) {
        const data = await roleResponse.json();
        setIsLoggedIn(true);
        setUserRole(data.role);
        localStorage.setItem('user', 'true');
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

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      validateSession();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('loginStateChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('loginStateChange', handleAuthChange);
    };
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
        
        // Dispatch events to notify other tabs
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('loginStateChange'));
        
        navigate('/login');
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar py-3">
        <div className="container">
          <Link to="/catalog" className="navbar-brand fw-bold fs-4">
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
        <Link to="/catalog" className="navbar-brand fw-bold fs-4">
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