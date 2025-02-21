import { useState } from 'react';
import AuthForm from './AuthForm';

export default function ForgotPassword() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND}/auth/forgot-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage('Reset instructions sent to your email');
        setError('');
      } else {
        setError(data.error || 'Failed to send reset instructions');
        setMessage('');
      }
    } catch (error) {
      setError('Failed to send reset instructions');
      setMessage('');
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Forgot Password"
      footerLink={{ to: '/login', text: 'Back to Login' }}
    >
      <div className="mb-4">
        <input 
          type="email"
          className="form-control bg-dark text-white"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
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