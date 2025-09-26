import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar, Trophy, Users, Eye, Home, AlertCircle, RefreshCw } from 'lucide-react';
import type { Eleccion } from '../services/eleccionService';

interface HistoryScreenProps {
  elections: Eleccion[];
  onSelectElection: (election: Eleccion) => void;
  onBack: () => void;
  onHome?: () => void;
}

export function PantallaHistorialElecciones({ elections, onSelectElection, onBack, onHome }: HistoryScreenProps) {
  const [error, setError] = useState<string | null>(null);

  // Validar datos de entrada
  useEffect(() => {
    if (!Array.isArray(elections)) {
      setError('Los datos de elecciones no son válidos');
    } else {
      setError(null);
    }
  }, [elections]);

  // Procesar elecciones usando useMemo para evitar re-renders innecesarios
  const processedElections = useMemo(() => {
    if (!Array.isArray(elections)) {
      return [];
    }

    try {
      return elections
        .filter(election => election && election.id_eleccion && election.nombre)
        .sort((a, b) => {
          try {
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
          } catch (error) {
            console.warn('Error ordenando elecciones:', error);
            return b.id_eleccion - a.id_eleccion;
          }
        });
    } catch (error) {
      console.error('Error procesando elecciones:', error);
      setError(error instanceof Error ? error.message : 'Error procesando datos');
      return [];
    }
  }, [elections]);

  const getStatusBadge = (status: Eleccion['estado']) => {
    const variants = {
      'DRAFT': 'secondary',
      'EN_CURSO': 'default',
      'FINALIZADA': 'destructive'
    } as const;

    const labels = {
      'DRAFT': 'Borrador',
      'EN_CURSO': 'En Curso',
      'FINALIZADA': 'Finalizada'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
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


  // Función para recalcular datos de manera segura
  const calculateElectionData = (election: Eleccion) => {
    try {
      const completedPositions = election.cargos?.filter(p => p && p.estado === 'FINALIZADO') || [];
      
      const totalVotes = election.cargos?.reduce((sum, position) => {
        if (!position || !position.candidatos) return sum;
        return sum + position.candidatos.reduce((posSum, candidate) => {
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Historial de Elecciones</h1>
              <p className="text-muted-foreground mt-1">
                Consulta los resultados de elecciones anteriores
              </p>
            </div>
          </div>
          {onHome && (
            <Button variant="outline" onClick={onHome}>
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
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
            </CardContent>
          </Card>
        )}

        {/* Elections List */}
        {!error && processedElections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay elecciones registradas</h3>
              <p className="text-muted-foreground">
                Crea tu primera elección para comenzar
              </p>
            </CardContent>
          </Card>
        ) : !error ? (
          <div className="space-y-6">
            {processedElections.map((election) => {
              const { completedPositions, totalVotes } = calculateElectionData(election);

              return (
                  <Card key={election.id_eleccion} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span>{election.nombre}</span>
                          </CardTitle>
                          <p className="text-muted-foreground mt-1">
                            {formatDate(election.fecha)}
                          </p>
                          {election.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {election.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(election.estado)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="flex items-center space-x-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Cargos</p>
                            <p className="font-semibold">{election.cargos?.length || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Completados</p>
                            <p className="font-semibold">{completedPositions.length}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Votos</p>
                            <p className="font-semibold">{totalVotes}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Candidatos</p>
                            <p className="font-semibold">
                              {election.cargos?.reduce((sum, cargo) => sum + (cargo.candidatos?.length || 0), 0) || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button 
                            onClick={() => onSelectElection(election)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>
                        </div>
                      </div>

                      {/* Winners Summary */}
                      {election.cargos && election.cargos.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3 flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>Ganadores</span>
                          </h4>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {election.cargos.map((position) => {
                              try {
                                if (!position || !position.candidatos || position.candidatos.length === 0) {
                                  return (
                                    <div key={position?.id_cargo || Math.random()} className="bg-muted/50 p-3 rounded-lg">
                                      <p className="font-semibold text-sm">{position?.catalogo?.nombre || 'Cargo'}</p>
                                      <p className="text-sm text-muted-foreground">Sin candidatos</p>
                                    </div>
                                  );
                                }

                                // Encontrar el candidato con más votos
                                const winner = position.candidatos.reduce((prev, current) => {
                                  if (!prev || !current) return current || prev;
                                  
                                  const prevVotos = prev.resultados && prev.resultados.length > 0 
                                    ? prev.resultados.reduce((rSum: number, r: any) => rSum + (r && typeof r.votos === 'number' ? r.votos : 0), 0)
                                    : 0;
                                  const currentVotos = current.resultados && current.resultados.length > 0 
                                    ? current.resultados.reduce((rSum: number, r: any) => rSum + (r && typeof r.votos === 'number' ? r.votos : 0), 0)
                                    : 0;
                                  return currentVotos > prevVotos ? current : prev;
                                });
                                
                                const winnerVotes = winner && winner.resultados && winner.resultados.length > 0 
                                  ? winner.resultados.reduce((rSum: number, r: any) => rSum + (r && typeof r.votos === 'number' ? r.votos : 0), 0)
                                  : 0;
                                
                                return (
                                  <div key={position.id_cargo} className="bg-muted/50 p-3 rounded-lg">
                                    <p className="font-semibold text-sm">{position.catalogo?.nombre || 'Cargo'}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {winner?.nombre_completo || 'Sin ganador'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {winnerVotes} votos
                                    </p>
                                  </div>
                                );
                              } catch (error) {
                                console.warn('Error procesando ganador:', error);
                                return (
                                  <div key={position?.id_cargo || Math.random()} className="bg-muted/50 p-3 rounded-lg">
                                    <p className="font-semibold text-sm">{position?.catalogo?.nombre || 'Cargo'}</p>
                                    <p className="text-sm text-muted-foreground">Error al cargar datos</p>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      )}

                      {election.estado === 'DRAFT' && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground italic">
                            Esta elección está en borrador y no se ha iniciado aún.
                          </p>
                        </div>
                      )}

                      {election.estado === 'EN_CURSO' && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground italic">
                            Esta elección está actualmente en progreso.
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
  );
}