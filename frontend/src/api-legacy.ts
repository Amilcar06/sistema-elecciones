// ARCHIVO DE COMPATIBILIDAD TEMPORAL
// Este archivo mantiene la compatibilidad con el código existente
// mientras se completa la migración a la nueva estructura

// Re-exportar desde la nueva estructura
export { API_URL } from './api/config';
export { authenticatedFetch } from './api/client';
export * from './api/types';

// Re-exportar servicios con nombres compatibles
export { authService as authAPI } from './services/authService';
export { dashboardService as dashboardAPI } from './services/dashboardService';

// Mantener compatibilidad con imports existentes
export { Usuario, LoginResponse, AuthError } from './api/types';
