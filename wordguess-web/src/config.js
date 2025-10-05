// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URL configuration
export const API_BASE = isDevelopment 
  ? 'http://localhost:5001'  // Development backend
  : 'https://wordguess-api-production.up.railway.app';  // Production backend - UPDATE THIS URL

// Fallback mode when backend is not available
export const USE_FALLBACK_MODE = isProduction && !import.meta.env.VITE_API_URL;

// Export configuration
export const config = {
  API_BASE,
  isDevelopment,
  isProduction
};
