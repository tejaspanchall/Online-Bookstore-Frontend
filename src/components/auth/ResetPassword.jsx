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
      <div className="mb-4">
        <input 
          type="password"
          className="form-control bg-dark text-white mb-3"
          placeholder="New Password"
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
          required
        />
        <input 
          type="password"
          className="form-control bg-dark text-white"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
      </div>
      
      <button 
        type="submit"
        className="btn btn-primary w-100 py-2"
      >
        Reset Password
      </button>

      {error && <div className="mt-3 alert alert-danger">{error}</div>}
      {message && <div className="mt-3 alert alert-success">{message}</div>}
    </AuthForm>
  );
}