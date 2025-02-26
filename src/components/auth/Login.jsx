import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

export default function Login() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.dispatchEvent(new Event('loginStateChange'));
      
      navigate('/catalog');
      
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
      {error && <div className="text-[var(--color-text-secondary)] text-sm mb-4">{error}</div>}
      
      <div className="mb-4">
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text-primary)]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      
      <button type="submit" className="w-full bg-[var(--color-button-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]">
        Login
      </button>
    </AuthForm>
  );
}