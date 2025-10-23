import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ArrowLeft, RefreshCw, Wifi, WifiOff, Trophy, Users, Home, ArrowRight } from 'lucide-react';
import { Eleccion } from '../services/eleccionService';
import { Cargo } from '../services/cargoService';
import { getResultadosPublicos } from '../services/eleccionService';

interface CandidatoResultado {
  id_candidato: number;
  nombre_completo: string;
  votos: number;
  porcentaje: number;
}

interface CargoResultado {
  id_cargo: number;
  nombre: string;
  candidatos: CandidatoResultado[];
  total_votos: number;
  ganador?: CandidatoResultado;
  numero_ronda?: number;
}

// Esta pantalla es exclusivamente para administradores
interface VisualizacionResultadosProps {
  // Props para modo admin (desde navegación interna)
  election: Eleccion | null;
  currentPosition: Cargo | null;
  onNextPosition: (nextPosition: Cargo | null) => void;
  onBack: () => void;
  onGoToSummary: () => void;
  onHome: () => void;
  
  // Configuración
  autoRefreshInterval?: number;
}

export function PantallaVisualizacionResultados({
  election,
  currentPosition,
  onNextPosition,
  onBack,
  onGoToSummary,
  onHome,
  autoRefreshInterval = 5000
}: VisualizacionResultadosProps) {
  const [resultadosPublicos, setResultadosPublicos] = useState<CargoResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false); // Auto-refresh desactivado por defecto en modo admin
  const intervalRef = useRef<number | null>(null);

  // Usar los datos de la elección y cargo actuales
  const activeElectionId = election?.id_eleccion;
  const activeCargoId = currentPosition?.id_cargo;

  // Función para cargar resultados
  const loadResultadosPublicos = async () => {
    if (!activeElectionId) return;
    
    try {
      setLoading(true);
      const data = await getResultadosPublicos(activeElectionId);
      
      const cargosResultados: CargoResultado[] = data.cargos.map((cargo: any) => {
        const rondaConResultados = cargo.rondas.find((r: any) => r.resultados && r.resultados.length > 0);
        
        if (!rondaConResultados || !rondaConResultados.resultados || rondaConResultados.resultados.length === 0) {
          return {
            id_cargo: cargo.id_cargo,
            nombre: cargo.catalogo.nombre,
            candidatos: [],
            total_votos: 0
          };
        }
        
        const totalVotos = rondaConResultados.resultados.reduce((sum: number, r: any) => sum + r.votos, 0);
        
        const candidatos: CandidatoResultado[] = rondaConResultados.resultados.map((resultado: any) => ({
          id_candidato: resultado.candidato.id_candidato,
          nombre_completo: resultado.candidato.nombre_completo,
          votos: resultado.votos,
          porcentaje: totalVotos > 0 ? (resultado.votos / totalVotos) * 100 : 0
        }));
        
        candidatos.sort((a, b) => b.votos - a.votos);
        const ganador = candidatos.length > 0 ? candidatos[0] : undefined;
        
        return {
          id_cargo: cargo.id_cargo,
          nombre: cargo.catalogo.nombre,
          candidatos,
          total_votos: totalVotos,
          ganador,
          numero_ronda: rondaConResultados.numero_ronda
        };
      });
      
      setResultadosPublicos(cargosResultados);
      setLastUpdate(new Date());
      setIsOnline(true);
    } catch (error) {
      console.error('Error cargando resultados públicos:', error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (activeElectionId) {
      loadResultadosPublicos();
    }
  }, [activeElectionId]);

  // Configurar actualización automática
  useEffect(() => {
    if (autoRefresh && activeElectionId) {
      intervalRef.current = setInterval(() => {
        loadResultadosPublicos();
      }, autoRefreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, activeElectionId, autoRefreshInterval]);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  if (!activeElectionId || !currentPosition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">No se encontró la elección o cargo</p>
          <Button onClick={onBack} className="mt-4">Volver</Button>
        </div>
      </div>
    );
  }

  // Obtener datos del cargo actual
  const cargoResultado = resultadosPublicos.find(c => c.id_cargo === currentPosition.id_cargo);
  const totalVotes = cargoResultado?.total_votos || 0;
  const sortedCandidates = cargoResultado?.candidatos.sort((a, b) => b.votos - a.votos) || [];
  const winner = cargoResultado?.ganador;

  // Obtener cargos completados para el panel lateral
  const completedPositions = resultadosPublicos.filter(c => c.ganador);

  // Función para obtener el color de la barra con diseño mejorado
  const getBarColor = (candidate: CandidatoResultado, isWinner: boolean | undefined, index: number) => {
    if (isWinner) {
      return 'bg-gradient-to-t from-amber-500 via-yellow-400 to-yellow-300 border-amber-600 shadow-lg shadow-amber-200';
    }
    
    // Colores alternativos para diferentes posiciones
    const colors = [
      'bg-gradient-to-t from-emerald-500 via-green-400 to-green-300 border-emerald-600 shadow-lg shadow-emerald-200',
      'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 border-blue-600 shadow-lg shadow-blue-200',
      'bg-gradient-to-t from-purple-500 via-purple-400 to-purple-300 border-purple-600 shadow-lg shadow-purple-200',
      'bg-gradient-to-t from-pink-500 via-pink-400 to-pink-300 border-pink-600 shadow-lg shadow-pink-200',
      'bg-gradient-to-t from-indigo-500 via-indigo-400 to-indigo-300 border-indigo-600 shadow-lg shadow-indigo-200'
    ];
    
    return colors[index % colors.length];
  };

  // Función para renderizar gráfico de barras horizontales (solo para admin)
  const renderBarChart = (candidates: CandidatoResultado[], winner: CandidatoResultado | undefined) => {
    const totalVotes = candidates.reduce((sum, c) => sum + c.votos, 0);
    const sortedCandidates = [...candidates].sort((a, b) => b.votos - a.votos);
    
    return (
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Resultados de Votación</h2>
          <p className="text-gray-600">Total de votos: <span className="font-semibold text-blue-600">{totalVotes}</span></p>
        </div>

        {/* Lista de candidatos con barras horizontales */}
        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => {
            const isWinner = winner && candidate.id_candidato === winner.id_candidato;
            const barWidth = totalVotes > 0 ? (candidate.votos / totalVotes) * 100 : 0;
            const position = index + 1;
            
            return (
              <div 
                key={candidate.id_candidato} 
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 ${
                  isWinner ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Información del candidato */}
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Posición */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${
                      position === 1 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' :
                      position === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                      position === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                      'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                    }`}>
                      {position}
                    </div>
                    
                    {/* Nombre y badge de ganador */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-2xl font-bold ${isWinner ? 'text-amber-700' : 'text-gray-800'}`}>
                          {candidate.nombre_completo}
                        </h3>
                        {isWinner && (
                          <div className="flex items-center space-x-1 bg-amber-100 px-3 py-1 rounded-full">
                            <Trophy className="h-5 w-5 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">GANADOR</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Barra de progreso horizontal */}
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                            isWinner 
                              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400' 
                              : candidate.votos > 0
                                ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400'
                                : 'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}
                          style={{ width: `${Math.max(barWidth, candidate.votos === 0 ? 2 : 0)}%` }}
                        >
                          {/* Efecto de brillo */}
                          <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Estadísticas */}
                  <div className="text-right space-y-1">
                    <div className="text-3xl font-bold text-gray-800">
                      {candidate.votos}
                    </div>
                    <div className="text-lg text-gray-600">
                      {candidate.porcentaje.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      votos
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer con estadísticas adicionales */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
            <div className="text-sm text-blue-700">Candidatos</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{candidates.reduce((sum, c) => sum + c.votos, 0)}</div>
            <div className="text-sm text-green-700">Total Votos</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {candidates.length > 0 ? (candidates.reduce((sum, c) => sum + c.votos, 0) / candidates.length).toFixed(1) : 0}
            </div>
            <div className="text-sm text-purple-700">Promedio</div>
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar resumen de votos
  const renderVoteSummary = (candidateCount: number) => (
    <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-muted-foreground">
        {candidateCount} candidato{candidateCount !== 1 ? 's' : ''} participando
      </p>
    </div>
  );

  // Función para renderizar controles de header (modo admin)
  const renderHeaderControls = () => {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </div>
        <Button variant="outline" onClick={onHome} size="sm">
          <Home className="h-4 w-4 mr-2" />
          Inicio
        </Button>
      </div>
    );
  };

  // Función para renderizar botones de navegación
  const renderNavigationButtons = () => {
    const currentIndex = resultadosPublicos.findIndex(c => c.id_cargo === currentPosition.id_cargo);
    const nextCargoResultado = resultadosPublicos[currentIndex + 1] || null;

    const handleNextPosition = () => {
      if (nextCargoResultado) {
        const nextCargo: Cargo = {
          id_cargo: nextCargoResultado.id_cargo,
          id_eleccion: election!.id_eleccion,
          id_catalogo: 0,
          orden: 0,
          estado: "PENDIENTE",
          catalogo: {
            id_catalogo: 0,
            nombre: nextCargoResultado.nombre,
            descripcion: ""
          }
        };
        onNextPosition(nextCargo);
      } else {
        onNextPosition(null);
      }
    };

    return (
      <div className="flex justify-center space-x-4 mt-8">
        {nextCargoResultado ? (
          <Button onClick={handleNextPosition} size="lg" className="px-8">
            Siguiente Cargo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={onGoToSummary} size="lg" className="px-8">
            Ver Resumen Final
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-8">
      {/* Header con controles */}
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        {renderHeaderControls()}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            {election?.nombre?.toUpperCase() || 'ELECCIÓN'} - RESULTADOS ADMINISTRATIVOS
          </h1>
          <div className="text-2xl text-muted-foreground">
            Cargo: <span className="font-bold text-primary">{currentPosition.catalogo?.nombre?.toUpperCase() || 'CARGO'}</span>
            {cargoResultado && (
              <>
                <span className="ml-2 text-lg">- Total: {totalVotes} votos</span>
                {cargoResultado.numero_ronda && cargoResultado.numero_ronda > 1 && (
                  <span className="ml-2 text-lg bg-yellow-200 px-3 py-1 rounded-full text-yellow-800 font-semibold">
                    RONDA {cargoResultado.numero_ronda}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Área principal de resultados */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
                  <span>Resultados de Votación</span>
                  {autoRefresh && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="text-center py-16">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
                    <p>Cargando resultados...</p>
                  </div>
                ) : !cargoResultado ? (
                  <div className="text-center py-16">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p>No hay resultados disponibles para este cargo</p>
                  </div>
                ) : sortedCandidates.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p>No hay candidatos registrados para este cargo</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Mostrar resultados para el cargo específico */}
                    {renderBarChart(sortedCandidates, winner)}
                    {renderVoteSummary(sortedCandidates.length)}
                    {renderNavigationButtons()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1">
              {/* Panel de ganadores elegidos */}
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Panel de Ganadores Electos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedPositions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay ganadores electos aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedPositions.map((cargoResultado) => (
                        <div key={cargoResultado.id_cargo} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold text-sm">{cargoResultado.nombre}</span>
                          </div>
                          <p className="font-bold">{cargoResultado.ganador?.nombre_completo}</p>
                          <p className="text-sm text-muted-foreground">
                            {cargoResultado.ganador?.votos} votos ({cargoResultado.ganador?.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progreso de elección */}
              <Card className="mt-6 bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Progreso de Elección</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cargos completados</span>
                        <span>{completedPositions.length}/{resultadosPublicos.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${resultadosPublicos.length > 0 ? (completedPositions.length / resultadosPublicos.length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {resultadosPublicos.length - completedPositions.length} cargo{resultadosPublicos.length - completedPositions.length !== 1 ? 's' : ''} pendiente{resultadosPublicos.length - completedPositions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
