import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const PublicRoute = ({ children }) => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/portfolios" replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
