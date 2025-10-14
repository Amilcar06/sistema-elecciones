// Tipos para autenticación
export interface Usuario {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  estado: string;
  ultimo_acceso?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken?: string;
  usuario: Usuario;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface AuthError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface AuthMeResponse {
  usuario: Usuario;
}

// Tipos para roles
export type UserRole = 'ADMIN' | 'ORGANIZADOR' | 'OBSERVADOR';

export interface RolePermissions {
  canManageUsers: boolean;
  canManageElections: boolean;
  canViewResults: boolean;
  canEditResults: boolean;
  canViewAudit: boolean;
}
