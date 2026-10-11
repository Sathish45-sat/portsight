import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
