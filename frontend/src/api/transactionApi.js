import axiosInstance from './axiosInstance';

export const transactionApi = {
  getByAsset: async (assetId) => {
    const response = await axiosInstance.get(`/api/assets/${assetId}/transactions`);
    return response.data;
  },

  create: async (assetId, data) => {
    let transactionDate = data.transactionDate || data.date;
    // Ensure seconds are included if coming from datetime-local input (YYYY-MM-DDTHH:mm)
    if (typeof transactionDate === 'string' && transactionDate.length === 16) {
      transactionDate = `${transactionDate}:00`;
    }

    const payload = {
      transactionType: data.transactionType || data.type,
      quantity: Number(data.quantity),
      pricePerUnit: Number(data.pricePerUnit !== undefined ? data.pricePerUnit : data.price),
      transactionDate,
    };
    const response = await axiosInstance.post(`/api/assets/${assetId}/transactions`, payload);
    return response.data;
  },
};

export default transactionApi;
