import { apiClient } from '../api/client';
import { AUTH_CONFIG } from '../api/config';
import { API_BASE_URL } from '../api/config';
import { 
  LoginRequest, 
  LoginResponse, 
  ChangePasswordRequest, 
  ChangePasswordResponse,
  AuthMeResponse,
  AuthError, 
  Usuario
} from '../api/types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Error en login');
  }

  return response.json();
}

export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Error refreshing token');
  }

  return response.json();
}

export async function getMe(): Promise<Usuario> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error obteniendo información del usuario');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem('token');
  
  if (!token) return;

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

// Servicio de autenticación
export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const data: LoginRequest = { email, password };
      return await apiClient.post<LoginResponse>('/auth/login', data);
    } catch (error) {
      // Manejo específico para errores de rate limiting
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('Demasiados intentos de login, intenta en 15 minutos');
      }
      throw new Error(error instanceof Error ? error.message : 'Error en el login');
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
      // No lanzar error para logout, ya que queremos limpiar el estado local
    }
  },

  /**
   * Obtener información del usuario actual
   */
  getMe: async (): Promise<AuthMeResponse> => {
    try {
      return await apiClient.get<AuthMeResponse>('/auth/me');
    } catch (error) {
      throw new Error('Error obteniendo información del usuario');
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (
    currentPassword: string, 
    newPassword: string
  ): Promise<ChangePasswordResponse> => {
    try {
      const data: ChangePasswordRequest = { currentPassword, newPassword };
      return await apiClient.put<ChangePasswordResponse>('/auth/change-password', data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error cambiando contraseña');
    }
  },

  /**
   * Verificar si el token es válido (método ligero)
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verificar si el token es válido (método completo con información del usuario)
   */
  verifyTokenWithUser: async (): Promise<boolean> => {
    try {
      await authService.getMe();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Refrescar access token usando refresh token
   */
  refreshToken: async (): Promise<{ token: string; refreshToken: string } | null> => {
    try {
      const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Actualizar tokens en localStorage
      authService.setTokens(data.token, data.refreshToken);
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      authService.clearAuth();
      return null;
    }
  },

  /**
   * Obtener access token del localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },

  /**
   * Obtener refresh token del localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  },

  /**
   * Guardar access token en localStorage
   */
  setToken: (token: string): void => {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  },

  /**
   * Guardar ambos tokens en localStorage
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Eliminar access token del localStorage
   */
  removeToken: (): void => {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  },

  /**
   * Eliminar refresh token del localStorage
   */
  removeRefreshToken: (): void => {
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  },

  /**
   * Obtener usuario del localStorage
   */
  getUser: (): any | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Guardar usuario en localStorage
   */
  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Eliminar usuario del localStorage
   */
  removeUser: (): void => {
    localStorage.removeItem('user');
  },

  /**
   * Limpiar toda la información de autenticación
   */
  clearAuth: (): void => {
    authService.removeToken();
    authService.removeRefreshToken();
    authService.removeUser();
  }
};
