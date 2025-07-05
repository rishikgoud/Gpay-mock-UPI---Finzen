// API Configuration for different environments
const getApiUrl = () => {
  // In development, use localhost backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  
  // In production, use environment variable or fallback to your backend URL
  return import.meta.env.VITE_API_URL || 'https://gpay-upi-backend-finzen.onrender.com';
};

export const API_BASE_URL = getApiUrl();

// Debug logging
console.log('API Configuration:', {
  isDev: import.meta.env.DEV,
  apiBaseUrl: API_BASE_URL,
  env: import.meta.env.MODE
});

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
  // Ensure base URL doesn't end with slash and endpoint starts with slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let url = `${baseUrl}${cleanEndpoint}`;
  
  // Replace parameters in URL
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  
  return url;
}; 