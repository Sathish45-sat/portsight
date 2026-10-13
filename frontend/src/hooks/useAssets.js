import { useState, useEffect, useCallback } from 'react';
import assetApi from '../api/assetApi';
import transactionApi from '../api/transactionApi';

export const useAssets = (portfolioId) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionsByAsset, setTransactionsByAsset] = useState({});

  const fetchAssets = useCallback(async () => {
    if (!portfolioId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await assetApi.getByPortfolio(portfolioId);
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load assets. Check your connection and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const createAsset = async (data) => {
    const created = await assetApi.create(portfolioId, data);
    await fetchAssets();
    return created;
  };

  const updatePrice = async (assetId, price) => {
    const updated = await assetApi.updatePrice(assetId, price);
    await fetchAssets();
    return updated;
  };

  const removeAsset = async (assetId) => {
    const result = await assetApi.remove(assetId);
    // Clean up cached transactions for deleted asset
    setTransactionsByAsset((prev) => {
      const next = { ...prev };
      delete next[assetId];
      return next;
    });
    await fetchAssets();
    return result;
  };

  const fetchTransactions = useCallback(async (assetId) => {
    if (!assetId) return [];

    setTransactionsByAsset((prev) => ({
      ...prev,
      [assetId]: {
        data: prev[assetId]?.data || [],
        loading: true,
        error: null,
      },
    }));

    try {
      const data = await transactionApi.getByAsset(assetId);
      const list = Array.isArray(data) ? data : [];
      setTransactionsByAsset((prev) => ({
        ...prev,
        [assetId]: {
          data: list,
          loading: false,
          error: null,
        },
      }));
      return list;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load transaction history.';
      setTransactionsByAsset((prev) => ({
        ...prev,
        [assetId]: {
          data: prev[assetId]?.data || [],
          loading: false,
          error: message,
        },
      }));
      throw err;
    }
  }, []);

  const recordTransaction = async (assetId, data) => {
    const result = await transactionApi.create(assetId, data);
    // Refetch the assets list so quantityHeld and avgBuyPrice update immediately,
    // and refetch the history for this asset.
    await Promise.all([fetchAssets(), fetchTransactions(assetId)]);
    return result;
  };

  return {
    assets,
    loading,
    error,
    fetchAssets,
    createAsset,
    updatePrice,
    removeAsset,
    transactionsByAsset,
    fetchTransactions,
    recordTransaction,
  };
};

export default useAssets;
