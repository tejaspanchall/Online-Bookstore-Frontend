import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PersonFill, JournalBookmark, PlusCircle } from 'react-bootstrap-icons';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    console.log('Auth state changed. Is logged in:', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('user'));
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('loginStateChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loginStateChange', checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch('https://backend-production-5a9b.up.railway.app/api/auth/get-role.php', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      const response = await fetch('https://backend-production-5a9b.up.railway.app/api/auth/logout.php', {
        method: 'POST',
        credentials: 'include', 
      });
  
      if (response.ok) {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
        
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('loginStateChange'));
        
        setTimeout(() => navigate('/login'), 50);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
                  <NavLink to="/my-library" className="nav-link d-flex align-items-center gap-1">
                    <PersonFill /> My Library
                  </NavLink>
                </li>
                {userRole === 'teacher' && (
                  <li className="nav-item">
                    <NavLink to="/add-book" className="btn btn-primary d-flex align-items-center gap-1">
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