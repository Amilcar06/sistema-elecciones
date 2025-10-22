import { API_CONFIG, DEFAULT_HEADERS, AUTH_CONFIG } from './config';
import { ApiError } from './types';

// Configuración de retry
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  retryableStatuses: [408, 500, 502, 503, 504], // Errores que se pueden reintentar (sin 429)
};

// Callback para manejar errores de autenticación
let onAuthError: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  onAuthError = handler;
};

// Función para calcular delay con backoff exponencial
const calculateDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Función para esperar un tiempo determinado
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Función para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
};

// Función para obtener el refresh token del localStorage
const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

// Función para almacenar tokens
const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
};

// Función para limpiar tokens
const clearTokens = (): void => {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

// Función para refrescar token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    
    // Actualizar tokens en localStorage
    setTokens(data.token, data.refreshToken);
    
    return data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    return null;
  }
};

// Función para verificar si un token está próximo a expirar
const isTokenNearExpiry = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    // Considerar "próximo a expirar" si queda menos de 5 minutos
    return timeUntilExpiry < 300; // 5 minutos
  } catch {
    return true; // Si no se puede decodificar, asumir que está expirado
  }
};

// Función para obtener headers con autenticación
const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    ...DEFAULT_HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Clase para manejar errores de la API
class ApiClientError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

// Función para hacer fetch con retry automático
const fetchWithRetry = async (
  url: string, 
  options: RequestInit, 
  attempt: number = 1
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // Si la respuesta es exitosa o no es retryable, devolverla
    if (response.ok || !RETRY_CONFIG.retryableStatuses.includes(response.status)) {
      // Manejo especial para rate limiting (429)
      if (response.status === 429) {
        console.warn(`Rate limit alcanzado para ${url}. No reintentando.`);
      }
      return response;
    }
    
    // Si hemos alcanzado el máximo de reintentos, devolver la respuesta
    if (attempt >= RETRY_CONFIG.maxRetries) {
      console.warn(`Máximo de reintentos alcanzado (${RETRY_CONFIG.maxRetries}) para ${url}`);
      return response;
    }
    
    // Calcular delay y esperar antes del siguiente intento
    const delay = calculateDelay(attempt);
    console.warn(`Reintentando petición a ${url} en ${delay}ms (intento ${attempt + 1}/${RETRY_CONFIG.maxRetries})`);
    await sleep(delay);
    
    // Reintentar la petición
    return fetchWithRetry(url, options, attempt + 1);
    
  } catch (error) {
    // Si es un error de red y no hemos alcanzado el máximo de reintentos
    if (attempt < RETRY_CONFIG.maxRetries) {
      const delay = calculateDelay(attempt);
      console.warn(`Error de red, reintentando petición a ${url} en ${delay}ms (intento ${attempt + 1}/${RETRY_CONFIG.maxRetries})`);
      await sleep(delay);
      return fetchWithRetry(url, options, attempt + 1);
    }
    
    // Si hemos alcanzado el máximo de reintentos, lanzar el error
    throw error;
  }
};

// Función para procesar la respuesta
const processResponse = async <T>(response: Response, originalRequest?: RequestInit): Promise<T> => {
  if (!response.ok) {
    let errorData: ApiError;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    // Manejar errores de autenticación (401)
    if (response.status === 401 && originalRequest) {
      console.warn('Error de autenticación detectado, intentando refrescar token:', errorData);
      
      // Intentar refrescar el token
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        // Reintentar la petición original con el nuevo token
        const newHeaders = {
          ...originalRequest.headers,
          'Authorization': `Bearer ${newAccessToken}`
        };
        
        const retryResponse = await fetch(response.url, {
          ...originalRequest,
          headers: newHeaders
        });
        
        // Procesar la respuesta reintentada
        return processResponse<T>(retryResponse);
      } else {
        // No se pudo refrescar el token, limpiar y notificar
        clearTokens();
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        
        if (onAuthError) {
          onAuthError();
        }
      }
    } else if (response.status === 401 || response.status === 403) {
      console.warn('Error de autenticación detectado:', errorData);
      
      // Limpiar tokens inválidos
      clearTokens();
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      
      // Notificar al contexto de autenticación
      if (onAuthError) {
        onAuthError();
      }
    }

    throw new ApiClientError(
      errorData.error || errorData.message || 'Error en la petición',
      response.status,
      errorData
    );
  }

  // Si la respuesta está vacía (status 204), retornar undefined
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch {
    throw new ApiClientError('Error al procesar la respuesta JSON', response.status);
  }
};

// Cliente HTTP base
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  // Método GET
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Verificar si el token está próximo a expirar antes de hacer la petición
    const token = getToken();
    if (token && isTokenNearExpiry(token)) {
      console.log('Token próximo a expirar, intentando refrescar...');
      await refreshAccessToken();
    }
    
    const requestOptions = {
      method: 'GET',
      headers: getAuthHeaders(),
      ...options,
    };
    
    const response = await fetchWithRetry(url, requestOptions);

    return processResponse<T>(response, requestOptions);
  }

  // Método POST
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Verificar si el token está próximo a expirar antes de hacer la petición
    const token = getToken();
    if (token && isTokenNearExpiry(token)) {
      console.log('Token próximo a expirar, intentando refrescar...');
      await refreshAccessToken();
    }
    
    const requestOptions = {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    };
    
    const response = await fetchWithRetry(url, requestOptions);

    return processResponse<T>(response, requestOptions);
  }

  // Método PUT
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions = {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    };
    
    const response = await fetchWithRetry(url, requestOptions);

    return processResponse<T>(response, requestOptions);
  }

  // Método PATCH
  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions = {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    };
    
    const response = await fetchWithRetry(url, requestOptions);

    return processResponse<T>(response, requestOptions);
  }

  // Método DELETE
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestOptions = {
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...options,
    };
    
    const response = await fetchWithRetry(url, requestOptions);

    return processResponse<T>(response, requestOptions);
  }

  // Método para peticiones sin autenticación
  async publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      ...options,
    });

    return processResponse<T>(response);
  }
}

// Instancia por defecto del cliente
export const apiClient = new ApiClient();

// Función de conveniencia para requests autenticados (compatibilidad con código existente)
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  
  const headers = {
    ...DEFAULT_HEADERS,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// Exportar la clase de error para uso externo
export { ApiClientError };
