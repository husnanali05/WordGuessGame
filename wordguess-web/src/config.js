// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Base URL configuration
export const API_BASE = isDevelopment 
  ? 'http://localhost:5001'  // Development backend
  : 'https://wordguess-api-production.up.railway.app';  // Production backend - UPDATE THIS URL

// Enable API calls with fallback for errors
export const USE_FALLBACK_MODE = false;

// Export configuration
export const config = {
  API_BASE,
  isDevelopment,
  isProduction
};
