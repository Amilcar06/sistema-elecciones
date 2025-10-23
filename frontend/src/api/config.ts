// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
} as const;

// Exportar API_URL para compatibilidad
export const API_URL = API_CONFIG.BASE_URL;

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// Configuración de autenticación
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  REFRESH_TOKEN_KEY: 'refresh_token',
  ACCESS_TOKEN_DURATION: 60 * 60 * 1000, // 1 hora en milisegundos
  REFRESH_TOKEN_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes de expirar
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('🌐 API BASE URL:', API_BASE_URL);
