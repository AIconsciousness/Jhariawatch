import axios from 'axios';

// Determine API base URL
// Priority: 1. Environment variable, 2. Production detection, 3. Development proxy
let API_BASE_URL = '/api'; // Default to proxy for development

// Check if we're in production (build mode)
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

// Check if we're in browser and not on localhost
const isProductionHost = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

if (import.meta.env.VITE_API_URL) {
  // Use environment variable if set
  API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
} else if (isProduction || isProductionHost) {
  // Production: Use backend URL directly
  API_BASE_URL = 'https://jhariyawatch-backend.onrender.com/api';
}

// Log configuration (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:');
  console.log('  - Base URL:', API_BASE_URL);
  console.log('  - Environment:', import.meta.env.MODE);
  console.log('  - Is Production:', isProduction);
  console.log('  - Hostname:', window.location.hostname);
  console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL || 'Not set');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request (always log for debugging)
    const fullURL = `${config.baseURL}${config.url}`;
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      endpoint: config.url,
      baseURL: config.baseURL,
      fullURL: fullURL
    });
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ API Response:', {
      url: response.config?.url,
      baseURL: response.config?.baseURL,
      fullURL: response.config?.baseURL + response.config?.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log all errors for debugging
    console.error('❌ API Error Details:');
    console.error('  - Message:', error.message);
    console.error('  - Request URL:', error.config?.baseURL + error.config?.url);
    console.error('  - Method:', error.config?.method);
    
    if (error.response) {
      // Server responded with error status
      console.error('  - Status:', error.response.status);
      console.error('  - Status Text:', error.response.statusText);
      console.error('  - Response Data:', error.response.data);
      console.error('  - Response Headers:', error.response.headers);
      
      // Special handling for 404
      if (error.response.status === 404) {
        console.error('⚠️ 404 Error - Endpoint not found!');
        console.error('  - Check if backend URL is correct:', error.config?.baseURL);
        console.error('  - Check if backend is running');
        console.error('  - Check if route exists:', error.config?.url);
      }
    } else if (error.request) {
      // Request made but no response received (network error, CORS, etc.)
      console.error('  - Network Error - No response received');
      console.error('  - Request:', error.request);
      console.error('  - Hint: Backend server might not be running, CORS issue, or network problem');
    } else {
      // Something else happened
      console.error('  - Other Error:', error);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const riskAPI = {
  getZones: (params) => api.get('/risk/zones', { params }),
  checkLocation: (lat, lng) => api.get('/risk/check', { params: { lat, lng } }),
  getZoneDetails: (zoneId) => api.get(`/risk/zones/${zoneId}`),
  getStatistics: () => api.get('/risk/statistics')
};

export const reportAPI = {
  submit: (data) => api.post('/reports', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  getMyReports: (params) => api.get('/reports', { params }),
  getAllReports: (params) => api.get('/reports/all', { params }),
  getReport: (reportId) => api.get(`/reports/${reportId}`)
};

export const alertAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getAlert: (alertId) => api.get(`/alerts/${alertId}`)
};

export const adminAPI = {
  seedDatabase: () => api.post('/admin/seed')
};

export default api;
