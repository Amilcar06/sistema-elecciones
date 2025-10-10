import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { Usuario } from '../api/types';
import { setAuthErrorHandler } from '../api/client';
import { SessionExpiredModal } from '../components/SessionExpiredModal';

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
  isUsuario: boolean;
  // Mantener compatibilidad con código existente
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
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  const isAuthenticated = !!usuario && !!token;
  const isAdmin = usuario?.rol === 'ADMIN';
  const isUsuario = usuario?.rol === 'USUARIO';
  
  // Mantener compatibilidad con código existente
  const isOrganizador = isAdmin; // ADMIN puede hacer todo lo que hacía ORGANIZADOR
  const isObservador = isAdmin || isUsuario; // Ambos roles pueden observar

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

  // Configurar el manejador de errores de autenticación solo cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setAuthErrorHandler(() => {
        console.log('Token expirado detectado, mostrando modal...');
        setShowSessionExpired(true);
      });
    } else {
      // Limpiar el manejador cuando no esté autenticado
      setAuthErrorHandler(() => {});
    }
  }, [isAuthenticated]);

  const handleTokenExpiration = () => {
    // Limpiar estado local
    setToken(null);
    setUsuario(null);
    
    // Limpiar localStorage
    authService.clearAuth();
    
    // Redirigir al login si no estamos ya ahí
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const handleSessionExpiredClose = () => {
    setShowSessionExpired(false);
    handleTokenExpiration();
  };

  const handleSessionExpiredLogin = () => {
    setShowSessionExpired(false);
    window.location.href = '/login';
  };

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
    isUsuario,
    isOrganizador,
    isObservador,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal
        isOpen={showSessionExpired}
        onClose={handleSessionExpiredClose}
        onLogin={handleSessionExpiredLogin}
      />
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
