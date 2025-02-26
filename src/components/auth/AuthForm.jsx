import { Link } from 'react-router-dom';

export default function AuthForm({ children, onSubmit, title, footerLink }) {
  return (
    <div className="flex justify-center bg-[var(--color-bg-primary)] pt-32">
      <form 
        onSubmit={onSubmit} 
        className="bg-[var(--color-bg-primary)] shadow-lg rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--color-text-primary)]">{title}</h2>
        <div className="mb-6">
          {children}
        </div>
        {footerLink && (
          <div className="text-center pt-4">
            <Link to={footerLink.to} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm">
              {footerLink.text}
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}