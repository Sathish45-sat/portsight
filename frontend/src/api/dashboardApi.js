import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getDashboard: async (portfolioId) => {
    const response = await axiosInstance.get(`/api/portfolios/${portfolioId}/dashboard`);
    return response.data;
  },
};

export default dashboardApi;
