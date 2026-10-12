import axiosInstance from './axiosInstance';

export const portfolioApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/api/portfolios');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/portfolios/${id}`);
    return response.data;
  },

  create: async (name) => {
    const response = await axiosInstance.post('/api/portfolios', { name });
    return response.data;
  },

  update: async (id, name) => {
    const response = await axiosInstance.put(`/api/portfolios/${id}`, { name });
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosInstance.delete(`/api/portfolios/${id}`);
    return response.data;
  },
};

export default portfolioApi;
