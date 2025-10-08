import { API_CONFIG, DEFAULT_HEADERS, AUTH_CONFIG } from './config';
import { ApiError } from './types';

// Función para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
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

// Función para procesar la respuesta
const processResponse = async <T>(response: Response): Promise<T> => {
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
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      ...options,
    });

    return processResponse<T>(response);
  }

  // Método POST
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return processResponse<T>(response);
  }

  // Método PUT
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return processResponse<T>(response);
  }

  // Método PATCH
  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    return processResponse<T>(response);
  }

  // Método DELETE
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...options,
    });

    return processResponse<T>(response);
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
