import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthForm from './AuthForm';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
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
      setMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      const res = await fetch('https://online-bookstore-backend-production.up.railway.app/auth/reset-password.php', {
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
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('Failed to reset password');
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

      {message && (
        <div className={`mt-3 alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
    </AuthForm>
  );
}