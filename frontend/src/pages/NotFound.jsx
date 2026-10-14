import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 flex items-center justify-center py-16">
        <div className="max-w-md w-full border border-rule bg-surface p-8 rounded-sm text-center space-y-4">
          <span className="text-4xl font-serif text-muted block">404</span>
          <h1 className="text-lg font-semibold text-ink tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-muted">
            The page you requested could not be found or may have been moved.
          </p>
          <div className="pt-2">
            <Link
              to="/portfolios"
              className="inline-block bg-accent text-surface text-sm font-medium px-4 py-2 rounded-sm hover:opacity-95 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
            >
              Return to portfolios
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
