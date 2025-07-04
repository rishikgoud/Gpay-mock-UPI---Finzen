// API Configuration for different environments
const getApiUrl = () => {
  // In development, use proxy
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, use environment variable or fallback to your backend URL
  return import.meta.env.VITE_API_URL || 'https://gpay-mock-upi-backend-fizen.onrender.com';
};

export const API_BASE_URL = getApiUrl();

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/upi/register',
  LOGIN: '/upi/login',
  AUTH: '/upi/auth',
  
  // User endpoints
  ME: '/upi/me',
  BALANCE: (upiId) => `/upi/balance/${upiId}`,
  TRANSACTIONS: (upiId) => `/upi/transactions/${upiId}`,
  FINZEN_TRANSACTIONS: (upiId) => `/upi/transactions/${upiId}/finzen`,
  
  // Payment endpoints
  SEND_MONEY: '/upi/send',
};

export const getApiEndpoint = (endpoint, params = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Replace parameters in URL
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  
  return url;
}; 