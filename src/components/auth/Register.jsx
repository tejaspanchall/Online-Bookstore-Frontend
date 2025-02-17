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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.email !== form.confirmEmail) {
      alert('Emails do not match');
      return;
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
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      alert('Failed to connect to server');
    }
  };

  return (
    <AuthForm 
      onSubmit={handleSubmit} 
      title="Register"
      footerLink={{ to: '/login', text: 'Already have an account? Login' }}
    >
      <div className="row g-3">
        <div className="col-md-6">
          <input 
            type="text"
            className="form-control bg-dark text-white"
            placeholder="First Name"
            value={form.firstname}
            onChange={e => setForm({...form, firstname: e.target.value})}
            required
          />
        </div>
        <div className="col-md-6">
          <input 
            type="text"
            className="form-control bg-dark text-white"
            placeholder="Last Name"
            value={form.lastname}
            onChange={e => setForm({...form, lastname: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="mt-3">
        <select 
          className="form-select bg-dark text-white"
          value={form.role}
          onChange={e => setForm({...form, role: e.target.value})}
          required
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </div>

      <div className="mt-3">
        <input 
          type="email"
          className="form-control bg-dark text-white"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />
      </div>

      <div className="mt-3">
        <input 
          type="email"
          className="form-control bg-dark text-white"
          placeholder="Confirm Email"
          value={form.confirmEmail}
          onChange={e => setForm({...form, confirmEmail: e.target.value})}
          required
        />
      </div>

      <div className="mt-3">
        <input 
          type="password"
          className="form-control bg-dark text-white"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required
        />
      </div>

      <button 
        type="submit"
        className="btn btn-primary w-100 mt-4 py-2"
      >
        Register
      </button>
    </AuthForm>
  );
}