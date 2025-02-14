import { Link } from 'react-router-dom';

export default function AuthForm({ children, onSubmit, title, footerLink }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <form 
        onSubmit={onSubmit} 
        className="auth-card p-5 text-white" 
        style={{width: '100%', maxWidth: '450px'}}
      >
        <h2 className="mb-4 text-center display-6 fw-bold">{title}</h2>
        <div className="mb-4">
          {children}
        </div>
        {footerLink && (
          <div className="text-center pt-3">
            <Link to={footerLink.to} className="text-decoration-none text-white">
              {footerLink.text}
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}