import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return { email: savedUser };
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Sync state if token was cleared externally (e.g. 401 interceptor)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');
      setToken(currentToken);
      if (currentUser) {
        try {
          setUser(JSON.parse(currentUser));
        } catch {
          setUser({ email: currentUser });
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });

      const { token: receivedToken, email: receivedEmail } = response.data;
      const userData = { email: receivedEmail || email };

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        email,
        password,
      });

      const { token: receivedToken, email: receivedEmail } = response.data;
      const userData = { email: receivedEmail || email };

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
