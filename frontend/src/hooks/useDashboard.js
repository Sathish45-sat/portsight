import { useState, useEffect, useCallback } from 'react';
import dashboardApi from '../api/dashboardApi';

export const useDashboard = (portfolioId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!portfolioId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const responseData = await dashboardApi.getDashboard(portfolioId);
      setData(responseData);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load dashboard data. Check your connection and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export default useDashboard;
