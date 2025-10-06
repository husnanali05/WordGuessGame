// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Use local storage for scores until backend is ready
export const USE_FALLBACK_MODE = true;
export const USE_LOCAL_STORAGE = true;

// API Base URL configuration - Force production URL for now
export const API_BASE = 'https://wordguess-api-production.up.railway.app';

// Debug environment detection
console.log('Environment detection:', { isDevelopment, isProduction, mode: import.meta.env.MODE });
console.log('API_BASE configured for:', 'https://wordguess-api-production.up.railway.app');
console.log('Fallback mode enabled:', USE_FALLBACK_MODE);
console.log('Build timestamp:', new Date().toISOString());

// Export configuration
export const config = {
  API_BASE,
  isDevelopment,
  isProduction
};
