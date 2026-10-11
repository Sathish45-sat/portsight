import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Portfolios from '../pages/Portfolios';
import PortfolioDetail from '../pages/PortfolioDetail';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes (redirect to /portfolios if already logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes (redirect to /login if unauthenticated) */}
      <Route
        path="/portfolios"
        element={
          <ProtectedRoute>
            <Portfolios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolios/:id"
        element={
          <ProtectedRoute>
            <PortfolioDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Root redirect to /portfolios */}
      <Route path="/" element={<Navigate to="/portfolios" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/portfolios" replace />} />
    </Routes>
  );
};

export default AppRouter;
