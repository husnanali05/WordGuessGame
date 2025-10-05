// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Debug environment detection
console.log('Environment detection:', { isDevelopment, isProduction, mode: import.meta.env.MODE });
console.log('API_BASE configured for:', 'https://wordguess-api-production.up.railway.app');

// API Base URL configuration - Force production URL for now
export const API_BASE = 'https://wordguess-api-production.up.railway.app';

// Enable API calls with fallback for errors
export const USE_FALLBACK_MODE = false;

// Export configuration
export const config = {
  API_BASE,
  isDevelopment,
  isProduction
};
