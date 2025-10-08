import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Home, 
  Users, 
  Vote, 
  Settings, 
  History, 
  LogOut, 
  User,
  Shield,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlobalSearch } from './GlobalSearch';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout, isAdmin, isOrganizador } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Manejo de teclas de acceso rápido
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K para abrir búsqueda global
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Escape para cerrar búsqueda
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      
      // Teclas de acceso rápido para navegación
      if (event.altKey) {
        switch (event.key) {
          case 'h':
            event.preventDefault();
            navigate('/');
            break;
          case 'd':
            event.preventDefault();
            navigate('/dashboard');
            break;
          case 'c':
            event.preventDefault();
            navigate('/candidates');
            break;
          case 'p':
            event.preventDefault();
            navigate('/positions');
            break;
          case 'r':
            event.preventDefault();
            navigate('/results');
            break;
          case 's':
            event.preventDefault();
            navigate('/summary');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isSearchOpen]);

  const getRolBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'destructive';
      case 'ORGANIZADOR': return 'default';
      case 'OBSERVADOR': return 'secondary';
      default: return 'outline';
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!usuario) return null;

  return (
    <nav 
      className="bg-background border-b border-border px-4 py-3 shadow-sm"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield 
              className="h-8 w-8 text-primary" 
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold text-foreground">
              Sistema Electoral
            </h1>
          </div>
        </div>

        {/* Navegación principal */}
        <div className="flex items-center space-x-1" role="menubar">
          {/* Botón de búsqueda global */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2"
            aria-label="Buscar en el sistema (Ctrl+K)"
            title="Buscar en el sistema (Ctrl+K)"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
            aria-current={isActive('/') ? 'page' : undefined}
            aria-label="Ir a la página de inicio (Alt+H)"
            title="Ir a la página de inicio (Alt+H)"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Inicio</span>
            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              Alt+H
            </kbd>
          </Button>

          {isOrganizador && (
            <>
              <Button
                variant={isActive('/positions') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/positions')}
                className="flex items-center space-x-2"
                aria-current={isActive('/positions') ? 'page' : undefined}
                aria-label="Gestionar cargos electorales"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span>Cargos</span>
              </Button>

              <Button
                variant={isActive('/candidates') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/candidates')}
                className="flex items-center space-x-2"
                aria-current={isActive('/candidates') ? 'page' : undefined}
                aria-label="Gestionar candidatos"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Candidatos</span>
              </Button>

              <Button
                variant={isActive('/results') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/results')}
                className="flex items-center space-x-2"
                aria-current={isActive('/results') ? 'page' : undefined}
                aria-label="Ver resultados de elecciones"
              >
                <Vote className="h-4 w-4" aria-hidden="true" />
                <span>Resultados</span>
              </Button>
            </>
          )}

          <Button
            variant={isActive('/history') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2"
            aria-current={isActive('/history') ? 'page' : undefined}
            aria-label="Ver historial de elecciones"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            <span>Historial</span>
          </Button>

          {isAdmin && (
            <Button
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
              aria-current={isActive('/dashboard') ? 'page' : undefined}
              aria-label="Acceder al panel de administración (Alt+D)"
              title="Acceder al panel de administración (Alt+D)"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Dashboard</span>
              <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                Alt+D
              </kbd>
            </Button>
          )}
        </div>

        {/* Información del usuario y logout */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2" role="group" aria-label="Información del usuario">
            <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-foreground">
              {usuario.nombre} {usuario.apellido}
            </span>
            <Badge 
              variant={getRolBadgeVariant(usuario.rol) as any}
              aria-label={`Rol: ${usuario.rol}`}
            >
              {usuario.rol}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Salir</span>
          </Button>
        </div>
      </div>

      {/* Búsqueda global */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </nav>
  );
};
