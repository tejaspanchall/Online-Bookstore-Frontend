import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthForm from './AuthForm';

export default function ResetPassword() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/auth/reset-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successful');
        setError('');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Failed to reset password');
        setMessage('');
      }
    } catch (error) {
      setError('Failed to reset password');
      setMessage('');
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Reset Password"
      footerLink={{ to: '/login', text: 'Back to Login' }}
    >
      <div className="mb-6">
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] mb-3"
            placeholder="New Password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
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
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
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
      
      <button 
        type="submit"
        className="w-full bg-[var(--color-button-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
      >
        Reset Password
      </button>

      {error && <div className="mt-4 text-[var(--color-text-secondary)] text-sm">{error}</div>}
      {message && <div className="mt-4 text-[var(--color-text-secondary)] text-sm">{message}</div>}
    </AuthForm>
  );
}