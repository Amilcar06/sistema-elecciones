import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, Eye, ArrowRight, Trophy, Users, Home } from 'lucide-react';
import { Eleccion } from '../services/eleccionService';
import { Cargo } from '../services/cargoService';
import { 
  getResultadosPublicos,
  getResumenFinal 
} from '../services/eleccionService';

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
  numero_ronda?: number; // Agregar información de la ronda
}

interface PublicDisplayProps {
  election: Eleccion | null;
  currentPosition: Cargo | null;
  onNextPosition: (nextPosition: Cargo | null) => void;
  onBack: () => void;
  onGoToSummary?: () => void; // Nueva prop para ir al resumen final
  onHome?: () => void; // Nueva prop para ir al inicio
}

export function PantallaVisualizacionPublica({ election, currentPosition, onNextPosition, onBack, onGoToSummary, onHome }: PublicDisplayProps) {
  const [revealResults, setRevealResults] = useState(false);
  const [animationProgress, setAnimationProgress] = useState<{ [candidateId: string]: number }>({});
  const [resultadosPublicos, setResultadosPublicos] = useState<CargoResultado[]>([]);
  const [resumenFinal, setResumenFinal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  // Cargar datos cuando cambie la elección
  useEffect(() => {
    if (election) {
      loadResultadosPublicos();
    }
  }, [election]);

  const loadResultadosPublicos = async () => {
    if (!election) return;
    try {
      setLoading(true);
      const data = await getResultadosPublicos(election.id_eleccion);
      
      // Transformar datos del backend al formato esperado por el frontend
      const cargosResultados: CargoResultado[] = data.cargos.map((cargo: any) => {
        // Obtener la ronda más reciente que tenga resultados
        // Las rondas vienen ordenadas por numero_ronda desc, así que tomamos la primera que tenga resultados
        const rondaConResultados = cargo.rondas.find((r: any) => r.resultados && r.resultados.length > 0);
        
        if (!rondaConResultados || !rondaConResultados.resultados || rondaConResultados.resultados.length === 0) {
          return {
            id_cargo: cargo.id_cargo,
            nombre: cargo.catalogo.nombre,
            candidatos: [],
            total_votos: 0
          };
        }
        
        // Calcular total de votos
        const totalVotos = rondaConResultados.resultados.reduce((sum: number, r: any) => sum + r.votos, 0);
        
        // Transformar candidatos con porcentajes
        const candidatos: CandidatoResultado[] = rondaConResultados.resultados.map((resultado: any) => ({
          id_candidato: resultado.candidato.id_candidato,
          nombre_completo: resultado.candidato.nombre_completo,
          votos: resultado.votos,
          porcentaje: totalVotos > 0 ? (resultado.votos / totalVotos) * 100 : 0
        }));
        
        // Ordenar por votos (descendente)
        candidatos.sort((a, b) => b.votos - a.votos);
        
        // Determinar ganador
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
    } catch (error) {
      console.error('Error cargando resultados públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResumenFinal = async () => {
    if (!election) return;
    try {
      setLoading(true);
      const data = await getResumenFinal(election.id_eleccion);
      setResumenFinal(data);
      setShowFinalSummary(true);
    } catch (error) {
      console.error('Error cargando resumen final:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (revealResults && currentPosition && resultadosPublicos.length > 0) {
      // Encontrar el cargo actual en los resultados
      const cargoResultado = resultadosPublicos.find(c => c.id_cargo === currentPosition.id_cargo);
      if (cargoResultado) {
        cargoResultado.candidatos.forEach((candidato, index) => {
          setTimeout(() => {
            setAnimationProgress(prev => ({
              ...prev,
              [candidato.id_candidato.toString()]: candidato.porcentaje
            }));
          }, index * 500);
        });
      }
    }
  }, [revealResults, currentPosition, resultadosPublicos]);

  if (!election || !currentPosition) {
    return null;
  }

  // Obtener datos del cargo actual desde los resultados públicos
  const cargoResultado = resultadosPublicos.find(c => c.id_cargo === currentPosition.id_cargo);
  const totalVotes = cargoResultado?.total_votos || 0;
  const sortedCandidates = cargoResultado?.candidatos.sort((a, b) => b.votos - a.votos) || [];
  const winner = cargoResultado?.ganador;

  // Get completed positions for winners panel
  const completedPositions = resultadosPublicos.filter(c => c.ganador);

  // Find next position
  const currentIndex = resultadosPublicos.findIndex(c => c.id_cargo === currentPosition.id_cargo);
  const nextCargoResultado = resultadosPublicos[currentIndex + 1] || null;

  const handleNextPosition = () => {
    if (nextCargoResultado) {
      // Crear un objeto Cargo básico para la navegación
      const nextCargo: Cargo = {
        id_cargo: nextCargoResultado.id_cargo,
        id_eleccion: election!.id_eleccion,
        id_catalogo: 0, // No necesario para la navegación
        orden: 0, // No necesario para la navegación
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-8">
      {/* Back button for admin */}
      <div className="absolute top-4 left-4">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </div>
      
      {/* Home button */}
      {onHome && (
        <div className="absolute top-4 right-4">
          <Button variant="outline" onClick={onHome} size="sm">
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            {election.nombre.toUpperCase()} - RESULTADOS
          </h1>
          <div className="text-2xl text-muted-foreground">
            Cargo en curso: <span className="font-bold text-primary">{currentPosition.catalogo?.nombre?.toUpperCase() || 'CARGO'}</span>
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
          {/* Main Results Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Resultados de Votación</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="text-center py-16">
                    <p>Cargando resultados...</p>
                  </div>
                ) : !cargoResultado ? (
                  <div className="text-center py-16">
                    <p>No hay resultados disponibles para este cargo</p>
                  </div>
                ) : !revealResults ? (
                  <div className="text-center py-16">
                    <Eye className="h-16 w-16 mx-auto text-primary mb-6" />
                    <h3 className="text-xl font-semibold mb-4">Resultados Listos</h3>
                    <p className="text-muted-foreground mb-8">
                      Presiona el botón para revelar los resultados
                    </p>
                    <Button 
                      onClick={() => setRevealResults(true)}
                      size="lg"
                      className="px-8 py-4 text-lg"
                    >
                      Revelar Resultados
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedCandidates.map((candidate, index) => {
                      const isWinner = winner && candidate.id_candidato === winner.id_candidato;
                      
                      return (
                        <div key={candidate.id_candidato} className={`p-6 rounded-lg border-2 ${isWinner ? 'border-yellow-400 bg-yellow-50' : 'border-border'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              {isWinner && <Trophy className="h-6 w-6 text-yellow-500" />}
                              <h3 className="text-xl font-bold">{candidate.nombre_completo}</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{candidate.votos} votos</div>
                              <div className="text-lg text-muted-foreground">({candidate.porcentaje.toFixed(1)}%)</div>
                            </div>
                          </div>
                          <Progress 
                            value={animationProgress[candidate.id_candidato.toString()] || 0} 
                            className="h-6"
                          />
                        </div>
                      );
                    })}

                    {winner && (
                      <div className="text-center mt-8 p-6 bg-yellow-100 rounded-lg border-2 border-yellow-400">
                        <Trophy className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                        <h2 className="text-3xl font-bold text-yellow-800">
                          🏆 GANADOR: {winner.nombre_completo}
                        </h2>
                        <p className="text-yellow-700 mt-2">
                          {winner.votos} votos ({winner.porcentaje.toFixed(1)}%)
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center space-x-4 mt-8">
                      {nextCargoResultado ? (
                        <Button onClick={handleNextPosition} size="lg" className="px-8">
                          Siguiente Cargo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button onClick={onGoToSummary || loadResumenFinal} size="lg" className="px-8">
                          Ver Resumen Final
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Winners Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Panel de Ganadores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedPositions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay ganadores aún</p>
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

            {/* Election Progress */}
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
                    <Progress 
                      value={resultadosPublicos.length > 0 ? (completedPositions.length / resultadosPublicos.length) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Botón para ir al resumen final cuando todos los cargos estén completados */}
                  {completedPositions.length > 0 && completedPositions.length === resultadosPublicos.length && (
                    <Button 
                      onClick={onGoToSummary || loadResumenFinal} 
                      className="w-full"
                      size="sm"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Ver Resumen Final
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}