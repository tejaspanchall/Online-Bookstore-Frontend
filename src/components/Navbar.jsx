import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PersonFill, JournalBookmark, PlusCircle } from 'react-bootstrap-icons';
import { AuthContext } from './context/AuthContext';

export default function Navbar() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserRole(user.role);
        setUserName(user);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('loginStateChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loginStateChange', checkAuth);
    };
  }, []);

  const handleLogout = async () => {
    logout();
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('loginStateChange'));
    
    setTimeout(() => navigate('/login'), 50);
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
                {userName && (
                  <li className="nav-item">
                  <NavLink to="/my-library" className="nav-link d-flex align-items-center gap-1">
                    <PersonFill /> {userName.firstname}'s Library
                  </NavLink>
                </li>
                )}
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