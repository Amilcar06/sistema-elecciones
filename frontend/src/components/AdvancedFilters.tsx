import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Calendar } from './ui/calendar';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaces para los filtros
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DateFilters {
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface EleccionFilters extends BaseFilters, DateFilters {
  estado?: string;
  usuario?: string;
  estados?: string[]; // Filtros múltiples
  usuarios?: string[]; // Filtros múltiples
}

export interface CargoFilters extends BaseFilters {
  estado?: string;
  eleccion?: string;
}

export interface CandidatoFilters extends BaseFilters {
  activo?: string;
  cargo?: string;
}

export interface UsuarioFilters extends BaseFilters {
  rol?: string;
  estado?: string;
}

// Props del componente
interface AdvancedFiltersProps {
  type: 'elecciones' | 'cargos' | 'candidatos' | 'usuarios';
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  availableUsers?: Array<{ id: number; nombre: string; apellido: string; email: string }>;
  availableElecciones?: Array<{ id_eleccion: number; nombre: string; estado: string }>;
  availableCargos?: Array<{ id_cargo: number; nombre: string; estado: string }>;
  className?: string;
}

export function AdvancedFilters({
  type,
  filters,
  onFiltersChange,
  onClearFilters,
  availableUsers = [],
  availableElecciones = [],
  availableCargos = [],
  className = ''
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [savedFilters, setSavedFilters] = useState<Array<{name: string, filters: any}>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  // Sincronizar filtros locales con los props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Cargar filtros guardados del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`advancedFilters_${type}`);
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Error cargando filtros guardados:', error);
      }
    }
  }, [type]);

  // Guardar filtros
  const saveFilters = () => {
    if (!saveFilterName.trim()) return;
    
    const newSavedFilters = [
      ...savedFilters.filter(f => f.name !== saveFilterName),
      { name: saveFilterName, filters: { ...localFilters } }
    ];
    
    setSavedFilters(newSavedFilters);
    localStorage.setItem(`advancedFilters_${type}`, JSON.stringify(newSavedFilters));
    setSaveFilterName('');
    setShowSaveDialog(false);
  };

  // Aplicar filtros guardados
  const applySavedFilters = (savedFilter: any) => {
    setLocalFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
  };

  // Eliminar filtros guardados
  const deleteSavedFilters = (filterName: string) => {
    const newSavedFilters = savedFilters.filter(f => f.name !== filterName);
    setSavedFilters(newSavedFilters);
    localStorage.setItem(`advancedFilters_${type}`, JSON.stringify(newSavedFilters));
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilter = (key: string) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => 
      localFilters[key] !== undefined && 
      localFilters[key] !== '' && 
      localFilters[key] !== null
    ).length;
  };

  // Filtros rápidos predefinidos
  const getQuickFilters = () => {
    switch (type) {
      case 'elecciones':
        return [
          { name: 'Hoy', filters: { fechaDesde: new Date().toISOString().split('T')[0], fechaHasta: new Date().toISOString().split('T')[0] } },
          { name: 'Esta semana', filters: { fechaDesde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } },
          { name: 'Este mes', filters: { fechaDesde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } },
          { name: 'Activas', filters: { estado: 'EN_CURSO' } },
          { name: 'Completadas', filters: { estado: 'COMPLETADA' } },
        ];
      case 'usuarios':
        return [
          { name: 'Activos', filters: { estado: 'ACTIVO' } },
          { name: 'Administradores', filters: { rol: 'ADMIN' } },
          { name: 'Usuarios', filters: { rol: 'USUARIO' } }
        ];
      default:
        return [];
    }
  };

  const applyQuickFilter = (quickFilter: any) => {
    setLocalFilters(quickFilter.filters);
    onFiltersChange(quickFilter.filters);
  };

  const renderDateFilter = (label: string, key: 'fechaDesde' | 'fechaHasta') => {
    const value = localFilters[key];
    const date = value ? new Date(value) : undefined;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                handleFilterChange(key, selectedDate ? selectedDate.toISOString().split('T')[0] : undefined);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClearFilter(key)}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    );
  };

  const renderSelectFilter = (
    label: string,
    key: string,
    options: Array<{ value: string; label: string }>,
    placeholder: string
  ) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Select
          value={localFilters[key] || ''}
          onValueChange={(value) => handleFilterChange(key, value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {localFilters[key] && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClearFilter(key)}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    );
  };

  const renderFilters = () => {
    switch (type) {
      case 'elecciones':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
              {localFilters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('search')}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Estado */}
            {renderSelectFilter(
              'Estado',
              'estado',
              [
                { value: 'DRAFT', label: 'Borrador' },
                { value: 'EN_CURSO', label: 'En Curso' },
                { value: 'FINALIZADA', label: 'Finalizada' }
              ],
              'Todos los estados'
            )}

            {/* Usuario creador */}
            {renderSelectFilter(
              'Usuario Creador',
              'usuario',
              availableUsers.map(user => ({
                value: user.id.toString(),
                label: `${user.nombre} ${user.apellido}`
              })),
              'Todos los usuarios'
            )}

            {/* Fecha desde */}
            {renderDateFilter('Fecha desde', 'fechaDesde')}

            {/* Fecha hasta */}
            {renderDateFilter('Fecha hasta', 'fechaHasta')}
          </div>
        );

      case 'cargos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre de cargo..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
              {localFilters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('search')}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Estado */}
            {renderSelectFilter(
              'Estado',
              'estado',
              [
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'EN_PROCESO', label: 'En Proceso' },
                { value: 'FINALIZADO', label: 'Finalizado' }
              ],
              'Todos los estados'
            )}

            {/* Elección */}
            {renderSelectFilter(
              'Elección',
              'eleccion',
              availableElecciones.map(eleccion => ({
                value: eleccion.id_eleccion.toString(),
                label: eleccion.nombre
              })),
              'Todas las elecciones'
            )}
          </div>
        );

      case 'candidatos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre de candidato..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
              {localFilters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('search')}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Estado */}
            {renderSelectFilter(
              'Estado',
              'activo',
              [
                { value: 'true', label: 'Activo' },
                { value: 'false', label: 'Inactivo' }
              ],
              'Todos los estados'
            )}

            {/* Cargo */}
            {renderSelectFilter(
              'Cargo',
              'cargo',
              availableCargos.map(cargo => ({
                value: cargo.id_cargo.toString(),
                label: cargo.nombre
              })),
              'Todos los cargos'
            )}
          </div>
        );

      case 'usuarios':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Búsqueda</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
              {localFilters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearFilter('search')}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Rol */}
            {renderSelectFilter(
              'Rol',
              'rol',
              [
                { value: 'ADMIN', label: 'Administrador' },
                { value: 'USUARIO', label: 'Usuario' }
              ],
              'Todos los roles'
            )}

            {/* Estado */}
            {renderSelectFilter(
              'Estado',
              'estado',
              [
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'INACTIVO', label: 'Inactivo' }
              ],
              'Todos los estados'
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-8 px-2 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Limpiar todo
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Filtros rápidos */}
              {getQuickFilters().length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filtros rápidos</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getQuickFilters().map((quickFilter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickFilter(quickFilter)}
                        className="text-xs h-7"
                      >
                        {quickFilter.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros guardados */}
              {savedFilters.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Filtros guardados</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                      className="h-6 px-2 text-xs"
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Guardar
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {savedFilters.map((savedFilter, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applySavedFilters(savedFilter)}
                          className="h-6 px-2 text-xs justify-start"
                        >
                          {savedFilter.name}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedFilters(savedFilter.name)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros principales */}
              <div className="border-t pt-4">
                {renderFilters()}
              </div>

              {/* Diálogo para guardar filtros */}
              {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <Card className="w-96">
                    <CardHeader>
                      <CardTitle>Guardar filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Nombre del filtro</Label>
                        <Input
                          value={saveFilterName}
                          onChange={(e) => setSaveFilterName(e.target.value)}
                          placeholder="Ej: Elecciones activas"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveFilters} disabled={!saveFilterName.trim()}>
                          Guardar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
