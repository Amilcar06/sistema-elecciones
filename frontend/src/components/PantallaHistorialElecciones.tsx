import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Calendar, Trophy, Users, Eye, Home, AlertCircle, RefreshCw, Play, CheckCircle, Link, Search, Filter, BarChart3, Clock, CheckCheck } from 'lucide-react';
import type { Eleccion } from '../services/eleccionService';
import { cambiarEstadoEleccion, eliminarEleccion } from '../services/eleccionService';
import { useAuth } from '../contexts/AuthContext';

interface HistoryScreenProps {
  elections: Eleccion[];
  onSelectElection: (election: Eleccion) => void;
  onBack: () => void;
  onHome?: () => void;
  onElectionUpdated?: (updatedElection: Eleccion) => void;
  onContinueElection?: (election: Eleccion, targetScreen: string, position?: any) => void;
}

export function PantallaHistorialElecciones({ elections, onSelectElection, onBack, onHome, onElectionUpdated, onContinueElection }: HistoryScreenProps) {
  const { isAdmin, usuario } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loadingElectionId, setLoadingElectionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'DRAFT' | 'EN_CURSO' | 'FINALIZADA'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');

  // Validar datos de entrada
  useEffect(() => {
    if (!Array.isArray(elections)) {
      setError('Los datos de elecciones no son válidos');
    } else {
      setError(null);
    }
  }, [elections]);

  // Procesar y filtrar elecciones con búsqueda y filtros
  const processedElections = useMemo(() => {
    if (!Array.isArray(elections)) {
      return [];
    }

    try {
      let filtered = elections
        .filter(election => election && election.id_eleccion && election.nombre)
        .filter(election => {
          // Filtro por usuario: ADMIN ve todas, USUARIO solo ve las suyas
          if (!isAdmin && usuario) {
            return election.id_usuario_creador === usuario.id_usuario;
          }
          return true;
        })
        .filter(election => {
          // Filtro por búsqueda
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return election.nombre.toLowerCase().includes(searchLower) ||
                   (election.descripcion && election.descripcion.toLowerCase().includes(searchLower));
          }
          return true;
        })
        .filter(election => {
          // Filtro por estado
          if (filterStatus !== 'all') {
            return election.estado === filterStatus;
          }
          return true;
        });

      // Ordenamiento
      filtered.sort((a, b) => {
        try {
          switch (sortBy) {
            case 'name':
              return a.nombre.localeCompare(b.nombre);
            case 'status':
              const statusOrder = { 'EN_CURSO': 0, 'DRAFT': 1, 'FINALIZADA': 2 };
              const statusA = statusOrder[a.estado as keyof typeof statusOrder] || 3;
              const statusB = statusOrder[b.estado as keyof typeof statusOrder] || 3;
              return statusA - statusB;
            case 'date':
            default:
              const fechaA = new Date(a.fecha).getTime();
              const fechaB = new Date(b.fecha).getTime();
              
              if (isNaN(fechaA) || isNaN(fechaB)) {
                return b.id_eleccion - a.id_eleccion;
              }
              
              if (fechaA === fechaB) {
                const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return createdB - createdA;
              }
              return fechaB - fechaA;
          }
        } catch (error) {
          console.warn('Error ordenando elecciones:', error);
          return b.id_eleccion - a.id_eleccion;
        }
      });

      return filtered;
    } catch (error) {
      console.error('Error procesando elecciones:', error);
      setError(error instanceof Error ? error.message : 'Error procesando datos');
      return [];
    }
  }, [elections, searchTerm, filterStatus, sortBy]);

  const getStatusBadge = (status: Eleccion['estado']) => {
    const configs = {
      'DRAFT': {
        variant: 'secondary' as const,
        label: 'Borrador',
        icon: <Clock className="h-3 w-3 mr-1" />,
        className: 'bg-gray-100 text-gray-700 border-gray-300'
      },
      'EN_CURSO': {
        variant: 'default' as const,
        label: 'En Curso',
        icon: <Play className="h-3 w-3 mr-1" />,
        className: 'bg-blue-100 text-blue-700 border-blue-300'
      },
      'FINALIZADA': {
        variant: 'destructive' as const,
        label: 'Finalizada',
        icon: <CheckCheck className="h-3 w-3 mr-1" />,
        className: 'bg-green-100 text-green-700 border-green-300'
      }
    };

    const config = configs[status];
    
    return (
      <Badge className={`${config.className} flex items-center font-medium`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

    // Función para eliminar una elección
  const handleDeleteElection = async (election: Eleccion) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la elección "${election.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarEleccion(election.id_eleccion);
      // Si tienes un callback para actualizar la lista, úsalo:
      if (onElectionUpdated) {
        onElectionUpdated(election);
      } else {
        // Si no, recarga la página para refrescar la lista
        window.location.reload();
      }
    } catch (error: any) {
      setError(error.message || "Error al eliminar elección");
    }
  };

  const handleContinueElection = async (election: Eleccion) => {
    if (loadingElectionId === election.id_eleccion) return;
    
    setLoadingElectionId(election.id_eleccion);
    try {
      // Determinar en qué paso está la elección
      const step = determineElectionStep(election);
      // Si la elección está en DRAFT y no tiene cargos, cambiar estado a EN_CURSO
      if (election.estado === "DRAFT" && step.screen === 'positions') {
        const updatedElection = await cambiarEstadoEleccion(election.id_eleccion, "EN_CURSO");
        if (onElectionUpdated) {
          onElectionUpdated(updatedElection);
        }
      }
      // Navegar a la pantalla correspondiente
      if (onContinueElection) {
        onContinueElection(election, step.screen, step.position);
      }
    } catch (error) {
      console.error('Error al continuar la elección:', error);
      setError('Error al continuar la elección');
    } finally {
      setLoadingElectionId(null);
    }
  };

  const getContinueButtonText = (election: Eleccion) => {
    const step = determineElectionStep(election);
    return `Continuar - ${step.description}`;
  };

  const getContinueButtonIcon = (estado: Eleccion['estado']) => {
    switch (estado) {
      case 'DRAFT':
        return <Play className="h-4 w-4 mr-2" />;
      case 'EN_CURSO':
        return <CheckCircle className="h-4 w-4 mr-2" />;
      default:
        return <Play className="h-4 w-4 mr-2" />;
    }
  };

  // Función para determinar en qué paso está la elección
  const determineElectionStep = (election: Eleccion) => {
    if (!election.cargos || election.cargos.length === 0) {
      return { screen: 'positions', description: 'Definir cargos' };
    }

    // Verificar si todos los cargos tienen candidatos
    const cargosSinCandidatos = election.cargos.filter(cargo => 
      !cargo.candidatos || cargo.candidatos.length === 0
    );

    if (cargosSinCandidatos.length > 0) {
      return { 
        screen: 'candidates', 
        description: 'Registrar candidatos',
        position: cargosSinCandidatos[0] // Primer cargo sin candidatos
      };
    }

    // Verificar si hay cargos sin resultados (sin rondas iniciadas)
    const cargosSinResultados = election.cargos.filter(cargo => {
      if (!cargo.rondas || cargo.rondas.length === 0) {
        return true;
      }
      // Verificar si hay rondas no finalizadas
      const rondasNoFinalizadas = cargo.rondas.filter((ronda: any) => !ronda.finalizada);
      return rondasNoFinalizadas.length === 0;
    });

    if (cargosSinResultados.length > 0) {
      return { 
        screen: 'results', 
        description: 'Ingresar resultados',
        position: cargosSinResultados[0] // Primer cargo sin resultados
      };
    }

    // Si todos los cargos tienen resultados, verificar si hay cargos no finalizados
    const cargosNoFinalizados = election.cargos.filter(cargo => cargo.estado !== 'FINALIZADO');
    
    if (cargosNoFinalizados.length > 0) {
      return { 
        screen: 'results', 
        description: 'Completar resultados',
        position: cargosNoFinalizados[0] // Primer cargo no finalizado
      };
    }

    // Si todos los cargos están finalizados, ir a visualización pública
    return { 
      screen: 'public', 
      description: 'Visualización pública',
      position: election.cargos[0] // Primer cargo para mostrar
    };
  };


  // Función para recalcular datos de manera segura
  const calculateElectionData = (election: Eleccion) => {
    try {
      const completedPositions = election.cargos?.filter(p => p && p.estado === 'FINALIZADO') || [];
      
      const totalVotes = election.cargos?.reduce((sum, position) => {
        if (!position || !position.candidatos) return sum;
        return sum + position.candidatos.reduce((posSum: any, candidate: { resultados: any[]; }) => {
          if (!candidate || !candidate.resultados) return posSum;
          return posSum + candidate.resultados.reduce((rSum: number, r: any) => {
            return rSum + (r && typeof r.votos === 'number' ? r.votos : 0);
          }, 0);
        }, 0);
      }, 0) || 0;

      return { completedPositions, totalVotes };
    } catch (error) {
      console.warn('Error calculando datos de elección:', error);
      return { completedPositions: [], totalVotes: 0 };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header mejorado */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Historial de Elecciones</h1>
                  <p className="text-gray-600 mt-1">
                    {isAdmin 
                      ? 'Gestiona y consulta todas las elecciones del sistema'
                      : 'Gestiona y consulta tus elecciones'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg shadow">
                  <div className="text-3xl font-bold text-blue-600">{processedElections.length}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg shadow">
                  <div className="text-3xl font-bold text-green-600">{processedElections.filter(e => e.estado === 'EN_CURSO').length}</div>
                  <div className="text-sm text-gray-500">En Curso</div>
                </div>
                <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg shadow">
                  <div className="text-3xl font-bold text-gray-600">{processedElections.filter(e => e.estado === 'FINALIZADA').length}</div>
                  <div className="text-sm text-gray-500">Finalizadas</div>
                </div>
              </div>

            </div>
          </div>

          {/* Controles de filtrado y búsqueda */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="EN_CURSO">En Curso</SelectItem>
                    <SelectItem value="DRAFT">Borrador</SelectItem>
                    <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Por fecha</SelectItem>
                    <SelectItem value="name">Por nombre</SelectItem>
                    <SelectItem value="status">Por estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 mb-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar elecciones</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recargar página
                </Button>
              </div>
            </div>
          )}

          {/* Elections List */}
          {!error && processedElections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No se encontraron elecciones' : 'No hay elecciones registradas'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primera elección para comenzar'
                }
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : !error ? (
            <div className="grid gap-6">
              {processedElections.map((election) => {
                const { completedPositions, totalVotes } = calculateElectionData(election);
                const step = determineElectionStep(election);

                return (
                  <Card key={election.id_eleccion} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
                    <CardContent className="p-6">
                      {/* Header de la card */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">{election.nombre}</h3>
                            {getStatusBadge(election.estado)}
                          </div>
                          <p className="text-gray-600 font-medium mb-1">
                            📅 {formatDate(election.fecha)}
                          </p>
                          {election.descripcion && (
                            <p className="text-gray-500 text-sm">
                              {election.descripcion}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Métricas principales */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-700">{election.cargos?.length || 0}</div>
                          <div className="text-xs text-blue-600">Cargos</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-700">{totalVotes}</div>
                          <div className="text-xs text-green-600">Total Votos</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-700">
                            {election.cargos?.reduce((sum, cargo) => sum + (cargo.candidatos?.length || 0), 0) || 0}
                          </div>
                          <div className="text-xs text-purple-600">Candidatos</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <CheckCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-orange-700">{completedPositions.length}</div>
                          <div className="text-xs text-orange-600">Completados</div>
                        </div>
                      </div>

                      {/* Acciones principales */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                        <div className="flex flex-wrap gap-2">
                          {/* Botón principal según estado */}
                          {(election.estado === 'DRAFT' || election.estado === 'EN_CURSO') && (
                            <Button 
                              onClick={() => handleContinueElection(election)}
                              disabled={loadingElectionId === election.id_eleccion}
                              style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: '1px solid #2563eb',
                                padding: '8px 12px',
                                fontWeight: '500',
                                minHeight: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                              className="hover:opacity-90 transition-opacity"
                            >
                              {loadingElectionId === election.id_eleccion ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                getContinueButtonIcon(election.estado)
                              )}
                              {getContinueButtonText(election)}
                            </Button>
                          )}
                          
                          {/* URL Pública */}
                          {election.estado !== 'FINALIZADA' && (
                            <Button 
                              onClick={() => window.open(`/realtime/${election.id_eleccion}`, '_blank')}
                              variant="outline"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Link className="h-4 w-4 mr-2" />
                              URL Pública
                            </Button>
                          )}

                          {/* Botón Eliminar */}
                          {(isAdmin || election.id_usuario_creador === usuario?.id_usuario) && (
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteElection(election)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>

                        {/* Botón Ver Detalle */}
                        <Button 
                          onClick={() => onSelectElection(election)}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      </div>

                      {/* Información contextual */}
                      {election.estado === 'DRAFT' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Esta elección está en borrador. Completa la configuración para iniciarla.
                          </p>
                        </div>
                      )}

                      {election.estado === 'EN_CURSO' && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 flex items-center">
                            <Play className="h-4 w-4 mr-2" />
                            Esta elección está en progreso. Puedes continuar desde: {determineElectionStep(election).description}
                          </p>
                        </div>
                      )}

                      {election.estado === 'FINALIZADA' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 flex items-center">
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Esta elección ha finalizado. Todos los resultados están disponibles.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}