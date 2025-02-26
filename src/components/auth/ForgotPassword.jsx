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
      <div className="mb-6">
        <input 
          type="email"
          className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
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