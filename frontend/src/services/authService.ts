import { apiClient } from '../api/client';
import { 
  LoginRequest, 
  LoginResponse, 
  ChangePasswordRequest, 
  ChangePasswordResponse,
  AuthMeResponse,
  AuthError 
} from '../api/types';

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
   * Verificar si el token es válido
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      await authService.getMe();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtener token del localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Guardar token en localStorage
   */
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  /**
   * Eliminar token del localStorage
   */
  removeToken: (): void => {
    localStorage.removeItem('token');
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
    authService.removeUser();
  }
};
