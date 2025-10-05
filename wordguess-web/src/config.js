// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URL configuration
export const API_BASE = isDevelopment 
  ? 'http://localhost:5001'  // Development backend
  : 'https://your-backend-url.railway.app';  // Production backend - UPDATE THIS

// Export configuration
export const config = {
  API_BASE,
  isDevelopment,
  isProduction
};
