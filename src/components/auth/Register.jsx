import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

export default function Register() {
  const BACKEND = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    confirmEmail: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.email !== form.confirmEmail) {
      setError('Emails do not match');
      return;
    }

    const required = ['firstname', 'lastname', 'email', 'password', 'role'];
    for (const field of required) {
      if (!form[field]) {
        setError(`Missing required field: ${field}`);
        return;
      }
    }
  
    try {
      const res = await fetch(`${BACKEND}/auth/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          password: form.password,
          role: form.role
        })
      });
  
      const data = await res.json();
      
      if (res.ok) {
        alert('Registration successful! Please login');
        navigate('/login');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Failed to connect to server');
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Register"
      footerLink={{ to: '/login', text: 'Already have an account? Login' }}
    >
      {error && <div className="text-[var(--color-text-secondary)] text-sm mb-4">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <input 
            type="text"
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            placeholder="First Name"
            value={form.firstname}
            onChange={e => setForm({...form, firstname: e.target.value})}
            required
          />
        </div>
        <div>
          <input 
            type="text"
            className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            placeholder="Last Name"
            value={form.lastname}
            onChange={e => setForm({...form, lastname: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <select 
          className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          value={form.role}
          onChange={e => setForm({...form, role: e.target.value})}
          required
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

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

      <div className="mb-4">
        <input 
          type="email"
          className="w-full px-4 py-2 border rounded-lg text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Confirm Email"
          value={form.confirmEmail}
          onChange={e => setForm({...form, confirmEmail: e.target.value})}
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

      <button 
        type="submit"
        className="w-full bg-[var(--color-button-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-button-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
      >
        Register
      </button>
    </AuthForm>
  );
}