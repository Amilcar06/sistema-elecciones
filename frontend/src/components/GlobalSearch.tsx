import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Search, 
  X, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  TrendingUp,
  Filter,
  SortAsc
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getElecciones } from '../services/eleccionService';
import { getCargos } from '../services/cargoService';
import { listarCandidatos } from '../services/candidatoService';
import { useAuth } from '../contexts/AuthContext';
// Hook simple para debounce de valores
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Interfaces para los resultados de búsqueda
interface SearchResult {
  id: number;
  type: 'eleccion' | 'cargo' | 'candidato';
  title: string;
  subtitle: string;
  description?: string;
  status?: string;
  date?: string;
  icon: React.ReactNode;
  route: string;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

export function GlobalSearch({ isOpen, onClose, placeholder = "Buscar elecciones, cargos, candidatos..." }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAdmin, usuario } = useAuth();
  
  // Debounce la búsqueda para evitar demasiadas peticiones
  const debouncedQuery = useDebounceValue(query, 300);

  // Enfocar el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cargar historial de búsquedas del localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(Array.isArray(history) ? history.slice(0, 10) : []);
      } catch (error) {
        console.error('Error cargando historial de búsquedas:', error);
      }
    }
  }, []);

  // Generar sugerencias basadas en el historial y datos
  useEffect(() => {
    if (query.length >= 1 && !showResults) {
      const historyMatches = searchHistory.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(historyMatches.slice(0, 5));
      setShowSuggestions(historyMatches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, searchHistory, showResults]);

  // Buscar cuando cambie la query
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  // Manejar teclas de navegación
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setShowResults(true);
    
    try {
      const searchResults: SearchResult[] = [];
      
      // Buscar elecciones
      try {
        const elecciones = await getElecciones();
        let eleccionesFiltradas = elecciones.filter(eleccion =>
          eleccion.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (eleccion.descripcion && eleccion.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        // Filtrar por usuario: ADMIN ve todas, USUARIO solo ve las suyas
        if (!isAdmin && usuario) {
          eleccionesFiltradas = eleccionesFiltradas.filter(eleccion => 
            eleccion.id_usuario_creador === usuario.id_usuario
          );
        }
        
        eleccionesFiltradas.forEach(eleccion => {
          searchResults.push({
            id: eleccion.id_eleccion,
            type: 'eleccion',
            title: eleccion.nombre,
            subtitle: `Elección - ${new Date(eleccion.fecha).toLocaleDateString()}`,
            description: eleccion.descripcion,
            status: eleccion.estado,
            date: eleccion.fecha,
            icon: <Calendar className="h-4 w-4" />,
            route: `/history`,
            metadata: { eleccion }
          });
        });
      } catch (error) {
        console.error('Error buscando elecciones:', error);
      }
      
      // Buscar cargos (solo si hay elecciones)
      try {
        const cargos = await getCargos();
        let cargosFiltrados = cargos.filter(cargo =>
          cargo.catalogo?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Filtrar por usuario: ADMIN ve todos, USUARIO solo ve los de sus elecciones
        if (!isAdmin && usuario) {
          cargosFiltrados = cargosFiltrados.filter(cargo => 
            cargo.eleccion?.id_usuario_creador === usuario.id_usuario
          );
        }
        
        cargosFiltrados.forEach(cargo => {
          searchResults.push({
            id: cargo.id_cargo,
            type: 'cargo',
            title: cargo.catalogo?.nombre || 'Cargo',
            subtitle: `Cargo - ${cargo.eleccion?.nombre || 'Elección'}`,
            description: cargo.catalogo?.descripcion,
            status: cargo.estado,
            icon: <Settings className="h-4 w-4" />,
            route: `/positions`,
            metadata: { cargo }
          });
        });
      } catch (error) {
        console.error('Error buscando cargos:', error);
      }
      
      // Buscar candidatos
      try {
        const candidatos = await listarCandidatos();
        let candidatosFiltrados = candidatos.filter(candidato =>
          candidato.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Filtrar por usuario: ADMIN ve todos, USUARIO solo ve los de sus elecciones
        if (!isAdmin && usuario) {
          candidatosFiltrados = candidatosFiltrados.filter(candidato => 
            candidato.cargo?.eleccion?.id_usuario_creador === usuario.id_usuario
          );
        }
        
        candidatosFiltrados.forEach(candidato => {
          searchResults.push({
            id: candidato.id_candidato,
            type: 'candidato',
            title: candidato.nombre_completo,
            subtitle: `Candidato - Cargo ${candidato.id_cargo}`,
            status: candidato.activo ? 'ACTIVO' : 'INACTIVO',
            icon: <Users className="h-4 w-4" />,
            route: `/candidates`,
            metadata: { candidato }
          });
        });
      } catch (error) {
        console.error('Error buscando candidatos:', error);
      }
      
      setResults(searchResults);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar búsqueda en historial
  const saveToHistory = (searchTerm: string) => {
    if (searchTerm.trim().length < 2) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleResultClick = (result: SearchResult) => {
    saveToHistory(query);
    navigate(result.route);
    onClose();
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
  };

  // Función para usar sugerencia del historial
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'DRAFT': 'secondary',
      'EN_CURSO': 'default',
      'FINALIZADA': 'destructive',
      'PENDIENTE': 'secondary',
      'EN_PROCESO': 'default',
      'FINALIZADO': 'destructive',
      'ACTIVO': 'default',
      'INACTIVO': 'outline'
    } as const;

    const labels = {
      'DRAFT': 'Borrador',
      'EN_CURSO': 'En Curso',
      'FINALIZADA': 'Finalizada',
      'PENDIENTE': 'Pendiente',
      'EN_PROCESO': 'En Proceso',
      'FINALIZADO': 'Finalizado',
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'eleccion':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'cargo':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'candidato':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4">
        <Card className="shadow-2xl">
          <CardContent className="p-0">
            {/* Barra de búsqueda */}
            <div className="flex items-center p-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="border-0 shadow-none text-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-2"
                aria-label="Cerrar búsqueda"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sugerencias del historial */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="border-b">
                <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground flex items-center">
                  <History className="h-3 w-3 mr-1" />
                  Búsquedas recientes
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center text-sm"
                    >
                      <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados */}
            {showResults && (
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Buscando...</span>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {query.trim().length < 2 
                          ? 'Escribe al menos 2 caracteres para buscar'
                          : 'No se encontraron resultados'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Header con estadísticas */}
                    <div className="px-4 py-2 bg-muted/30 border-b text-xs text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Search className="h-3 w-3" />
                          {results.length} resultado{results.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-3">
                          {results.filter(r => r.type === 'eleccion').length > 0 && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {results.filter(r => r.type === 'eleccion').length} elección{results.filter(r => r.type === 'eleccion').length !== 1 ? 'es' : ''}
                            </span>
                          )}
                          {results.filter(r => r.type === 'cargo').length > 0 && (
                            <span className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              {results.filter(r => r.type === 'cargo').length} cargo{results.filter(r => r.type === 'cargo').length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {results.filter(r => r.type === 'candidato').length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {results.filter(r => r.type === 'candidato').length} candidato{results.filter(r => r.type === 'candidato').length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <SortAsc className="h-3 w-3" />
                        <span>Ordenado por relevancia</span>
                      </div>
                    </div>
                    
                    {/* Lista de resultados */}
                    <div className="p-2">
                      {results.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            index === selectedIndex 
                              ? 'bg-primary/10 border border-primary/20' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            {getTypeIcon(result.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium truncate">{result.title}</p>
                                {result.status && getStatusBadge(result.status)}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                              {result.description && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.type === 'eleccion' && result.date && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(result.date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Atajos de teclado */}
            {showResults && results.length > 0 && (
              <div className="px-4 py-2 border-t bg-muted/30">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Navegar</span>
                    <span>↵ Seleccionar</span>
                    <span>Esc Cerrar</span>
                  </div>
                  <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
