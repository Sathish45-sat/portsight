import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="bg-surface border-b border-rule">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand & Main Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/portfolios" className="text-base font-semibold text-ink tracking-tight hover:text-accent focus-visible:outline-accent">
            PortSight
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/portfolios"
              className={`text-sm transition-colors focus-visible:outline-accent ${
                isActive('/portfolios')
                  ? 'text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Portfolios
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm transition-colors focus-visible:outline-accent ${
                isActive('/dashboard')
                  ? 'text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-muted hidden sm:inline">
              {user.email}
            </span>
          )}

          <button
            id="logout-button"
            type="button"
            onClick={handleLogout}
            className="text-sm text-muted hover:text-ink border border-rule bg-surface px-3 py-1.5 rounded-sm transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
