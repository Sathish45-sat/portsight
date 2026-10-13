import axiosInstance from './axiosInstance';

export const assetApi = {
  getByPortfolio: async (portfolioId) => {
    const response = await axiosInstance.get(`/api/portfolios/${portfolioId}/assets`);
    return response.data;
  },

  getById: async (assetId) => {
    const response = await axiosInstance.get(`/api/assets/${assetId}`);
    return response.data;
  },

  create: async (portfolioId, data) => {
    const payload = {
      symbol: data.symbol,
      name: data.name,
      assetType: data.assetType || data.type,
      currentPrice: data.currentPrice,
    };
    const response = await axiosInstance.post(`/api/portfolios/${portfolioId}/assets`, payload);
    return response.data;
  },

  updatePrice: async (assetId, price) => {
    const payload = typeof price === 'object' && price !== null ? price : { price: Number(price) };
    const response = await axiosInstance.put(`/api/assets/${assetId}/price`, payload);
    return response.data;
  },

  remove: async (assetId) => {
    const response = await axiosInstance.delete(`/api/assets/${assetId}`);
    return response.data;
  },
};

export default assetApi;
