import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    config.headers['X-User-Id'] = String(user.id);
    config.headers['X-User-Role'] = user.role;
  }
  return config;
});

export interface ProductListParams {
  search?: string;
  page?: number;
  sort?: string;
  direction?: string;
  category?: string;
}

export const productApi = {
  list: (params?: ProductListParams) => api.get('/api/products', { params }),
  get: (id: number) => api.get(`/api/products/${id}`),
  create: (data: { name: string; description?: string; price: number; stock: number; category: string }) =>
    api.post('/api/products', data),
  update: (id: number, data: { name?: string; description?: string; price?: number; stock?: number; category?: string }) =>
    api.put(`/api/products/${id}`, data),
};

export const orderApi = {
  create: (items: { productId: number; quantity: number }[]) =>
    api.post('/api/orders', { items }),
  get: (id: number) => api.get(`/api/orders/${id}`),
  checkout: (id: number) => api.post(`/api/orders/${id}/checkout`),
};

export default api;
