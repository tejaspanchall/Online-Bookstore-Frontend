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
    <nav className="bg-[var(--color-primary)] shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/catalog" className="text-2xl font-bold text-white flex items-center">
          <JournalBookmark className="mr-2 text-white" />
          <span className="text-white">Book</span>
          <span className="text-[var(--color-text-logo)]">Cafe</span>
        </Link>

        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              {userName && (
                <NavLink to="/my-library" className="text-white hover:text-[var(--color-text-light)] flex items-center">
                  <PersonFill className="mr-1" /> {userName.firstname}'s Library
                </NavLink>
              )}
              {userRole === 'teacher' && (
                <NavLink to="/add-book" className="bg-[var(--color-text-secondary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-text-light)] hover:text-white flex items-center transition duration-300">
                  <PlusCircle className="mr-1" /> Add Book
                </NavLink>
              )}
              <button 
                onClick={handleLogout} 
                className="text-white hover:text-[red] focus:outline-none transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-white hover:text-[var(--color-text-light)] transition duration-300">
                Login
              </NavLink>
              <NavLink to="/register" className="bg-[var(--color-text-secondary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-text-light)] hover:text-white transition duration-300">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}