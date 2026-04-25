import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateSellerProfile: (data) => api.put('/auth/seller-profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  addAddress: (data) => api.post('/auth/addresses', data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
};

// ─── Products ───────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  getStates: () => api.get('/products/states'),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getSellerProducts: (params) => api.get('/products/seller', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Cart ───────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
};

// ─── Orders ─────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, data) => api.post(`/orders/${id}/cancel`, data),
  getSellerOrders: (params) => api.get('/orders/seller', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ─── Payments ───────────────────────────────────────────
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getStatus: (orderId) => api.get(`/payments/status/${orderId}`),
};

// ─── Dashboard ──────────────────────────────────────────
export const dashboardAPI = {
  getSeller: () => api.get('/dashboard/seller'),
  getAdmin: () => api.get('/dashboard/admin'),
  getUsers: (params) => api.get('/dashboard/admin/users', { params }),
  toggleUser: (id) => api.put(`/dashboard/admin/users/${id}/toggle`),
  verifySeller: (id, data) => api.put(`/dashboard/admin/sellers/${id}/verify`, data),
  getWishlist: () => api.get('/dashboard/wishlist'),
  toggleWishlist: (data) => api.post('/dashboard/wishlist', data),
  addReview: (data) => api.post('/dashboard/reviews', data),
  getNotifications: () => api.get('/dashboard/notifications'),
  markNotificationsRead: () => api.put('/dashboard/notifications/read'),
};

// ─── Support ────────────────────────────────────────────
export const supportAPI = {
  create: (data) => api.post('/support', data),
  getAll: () => api.get('/support'),
  getById: (id) => api.get(`/support/${id}`),
  reply: (id, data) => api.post(`/support/${id}/reply`, data),
  updateStatus: (id, data) => api.put(`/support/${id}/status`, data),
};

// ─── Map & Cultural ─────────────────────────────────────
export const mapAPI = {
  getDistricts: (params) => api.get('/map/districts', { params }),
  getDistrictDetail: (name) => api.get(`/map/districts/${name}`),
  getMapStats: () => api.get('/map/stats'),
  getOdop: (params) => api.get('/map/odop', { params }),
  getOdopStates: () => api.get('/map/odop/states'),
  getArticles: (params) => api.get('/map/articles', { params }),
  getArticle: (slug) => api.get(`/map/articles/${slug}`),
};

// ─── AI Validation ──────────────────────────────────────
export const validateAPI = {
  product: (data) => api.post('/validate/product', data),
};

export default api;
