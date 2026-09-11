import axios from 'axios';

let apiBase = import.meta.env.VITE_API_URL;
if (apiBase) {
  apiBase = apiBase.trim().replace(/\/+$/, '');
  if (!apiBase.endsWith('/api')) {
    apiBase = `${apiBase}/api`;
  }
}
const baseURL = apiBase || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mismatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('mismatch_token');
        localStorage.removeItem('mismatch_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
