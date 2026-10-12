import { useState, useEffect, useCallback } from 'react';
import portfolioApi from '../api/portfolioApi';

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portfolioApi.getAll();
      setPortfolios(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load portfolios. Check your connection and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const create = async (name) => {
    const created = await portfolioApi.create(name);
    await fetchPortfolios();
    return created;
  };

  const rename = async (id, name) => {
    const updated = await portfolioApi.update(id, name);
    await fetchPortfolios();
    return updated;
  };

  const remove = async (id) => {
    const result = await portfolioApi.remove(id);
    await fetchPortfolios();
    return result;
  };

  return {
    portfolios,
    loading,
    error,
    fetchPortfolios,
    create,
    rename,
    remove,
  };
};

export default usePortfolios;
