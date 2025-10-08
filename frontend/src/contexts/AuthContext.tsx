import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { Usuario } from '../api/types';

// Usuario ya está importado desde api/types

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isOrganizador: boolean;
  isObservador: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!usuario && !!token;
  const isAdmin = usuario?.rol === 'ADMIN';
  const isOrganizador = ['ADMIN', 'ORGANIZADOR'].includes(usuario?.rol || '');
  const isObservador = ['ADMIN', 'ORGANIZADOR', 'OBSERVADOR'].includes(usuario?.rol || '');

  const hasRole = (roles: string[]) => {
    return usuario ? roles.includes(usuario.rol) : false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUsuario(data.usuario);
      authService.setToken(data.token);
      authService.setUser(data.usuario);
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }

    setToken(null);
    setUsuario(null);
    authService.clearAuth();
  };

  const checkAuth = async (): Promise<boolean> => {
    const storedToken = authService.getToken();
    const storedUser = authService.getUser();

    if (!storedToken || !storedUser) {
      setIsLoading(false);
      return false;
    }

    try {
      // Verificar que el token sigue siendo válido
      const data = await authService.getMe();
      setToken(storedToken);
      setUsuario(data.usuario);
      return true;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      authService.clearAuth();
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    usuario,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    hasRole,
    isAdmin,
    isOrganizador,
    isObservador,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
