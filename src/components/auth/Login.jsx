import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

export default function Login() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.dispatchEvent(new Event('loginStateChange'));
      
      if (data.user.role === 'teacher') {
        navigate('/catalog');
      } else if (data.user.role === 'student') {
        navigate('/catalog');
      } else {
        navigate('/my-library');
      }
      
    } catch (error) {
      setError('Failed to connect to server');
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Login" 
      footerLink={{ to: '/forgot-password', text: 'Forgot Password?' }}
    >
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="mb-3">
        <input
          type="email"
          className="form-control bg-dark text-white"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />
      </div>

      <div className="mb-3">
        <input
          type="password"
          className="form-control bg-dark text-white"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required
        />
      </div>
      
      <button type="submit" className="btn btn-primary w-100">
        Login
      </button>
    </AuthForm>
  );
}