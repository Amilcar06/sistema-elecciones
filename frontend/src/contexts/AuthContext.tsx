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
  const [isInitialized, setIsInitialized] = useState(false);

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
      
      // Guardar ambos tokens si están disponibles
      if (data.refreshToken) {
        authService.setTokens(data.token, data.refreshToken);
      } else {
        authService.setToken(data.token);
      }
      
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
    const storedRefreshToken = authService.getRefreshToken();
    const storedUser = authService.getUser();

    if (!storedToken || !storedUser) {
      console.log('No hay token o usuario almacenado');
      setIsLoading(false);
      return false;
    }

    try {
      // Primero intentar verificar si el token es válido (método ligero)
      console.log('Verificando token almacenado...');
      const isValid = await authService.verifyToken();
      
      if (isValid) {
        console.log('Token válido, restaurando sesión');
        setToken(storedToken);
        setUsuario(storedUser);
        return true;
      }
      
      console.log('Token no válido, intentando refrescar...');
      // Si el token no es válido pero tenemos refresh token, intentar refrescar
      if (storedRefreshToken) {
        try {
          const refreshData = await authService.refreshToken();
          if (refreshData) {
            console.log('Token refrescado exitosamente');
            setToken(refreshData.token);
            // Obtener información actualizada del usuario
            const userData = await authService.getMe();
            setUsuario(userData.usuario);
            return true;
          }
        } catch (refreshError) {
          console.error('Error refrescando token:', refreshError);
          // Si el refresh falla, limpiar todo
          authService.clearAuth();
        }
      }
      
      console.log('No se pudo restaurar la sesión, limpiando datos');
      authService.clearAuth();
      return false;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      // En caso de error de red, mantener la sesión local temporalmente
      if (error instanceof Error && error.message.includes('fetch')) {
        console.log('Error de red, manteniendo sesión local');
        setToken(storedToken);
        setUsuario(storedUser);
        return true;
      }
      authService.clearAuth();
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialized) {
        await checkAuth();
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isInitialized]);

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
