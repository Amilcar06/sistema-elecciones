import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { RefreshCw, Copy } from 'lucide-react';
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
  estado: 'preparando' | 'en_progreso' | 'completado' | 'sin_candidatos';
  tiene_candidatos: boolean;
  tiene_ronda_activa: boolean;
}

interface PantallaPublicaResultadosProps {
  electionId: number;
  autoRefreshInterval?: number;
  showUrlControls?: boolean; // Para mostrar controles de URL cuando se accede desde admin
  currentCargoId?: number; // Para destacar el cargo actual (opcional, solo desde admin)
}

export function PantallaPublicaResultados({
  electionId,
  autoRefreshInterval = 3000, // Actualización más frecuente para modo público
  showUrlControls = false,
  currentCargoId
}: PantallaPublicaResultadosProps) {
  const [resultadosPublicos, setResultadosPublicos] = useState<CargoResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [electionName, setElectionName] = useState<string>('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Función para cargar resultados públicos
  const loadResultadosPublicos = async () => {
    if (!electionId) return;
    
    try {
      setLoading(true);
      const data = await getResultadosPublicos(electionId);
      
      // Guardar nombre de la elección
      if (data.nombre) {
        setElectionName(data.nombre);
      }
      
      const cargosResultados: CargoResultado[] = data.cargos.map((cargo: any) => {
        const tieneCandidatos = cargo.candidatos && cargo.candidatos.length > 0;
        const rondaActiva = cargo.rondas.find((r: any) => !r.finalizada);
        const rondaConResultados = cargo.rondas.find((r: any) => r.resultados && r.resultados.length > 0);
        
        // Determinar estado del cargo
        let estado: 'preparando' | 'en_progreso' | 'completado' | 'sin_candidatos';
        
        if (!tieneCandidatos) {
          estado = 'sin_candidatos';
        } else if (!rondaActiva && !rondaConResultados) {
          estado = 'preparando';
        } else if (rondaActiva && (!rondaConResultados || rondaConResultados.resultados.length === 0)) {
          estado = 'en_progreso';
        } else if (rondaConResultados && rondaConResultados.resultados.length > 0) {
          // Verificar si hay un ganador claro (no empate)
          const resultados = rondaConResultados.resultados;
          const totalVotos = resultados.reduce((sum: number, r: any) => sum + r.votos, 0);
          
          if (totalVotos > 0) {
            const votosOrdenados = resultados.map((r: any) => r.votos).sort((a: number, b: number) => b - a);
            const hayEmpate = votosOrdenados[0] === votosOrdenados[1];
            
            if (hayEmpate && rondaConResultados.numero_ronda === 1) {
              estado = 'en_progreso'; // Necesita segunda ronda
            } else {
              estado = 'completado';
            }
          } else {
            estado = 'en_progreso';
          }
        } else {
          estado = 'preparando';
        }
        
        // Procesar candidatos y resultados
        let candidatos: CandidatoResultado[] = [];
        let totalVotos = 0;
        let ganador: CandidatoResultado | undefined;
        
        if (rondaConResultados && rondaConResultados.resultados && rondaConResultados.resultados.length > 0) {
          totalVotos = rondaConResultados.resultados.reduce((sum: number, r: any) => sum + r.votos, 0);
          
          candidatos = rondaConResultados.resultados.map((resultado: any) => ({
            id_candidato: resultado.candidato.id_candidato,
            nombre_completo: resultado.candidato.nombre_completo,
            votos: resultado.votos,
            porcentaje: totalVotos > 0 ? (resultado.votos / totalVotos) * 100 : 0
          }));
          
          candidatos.sort((a, b) => b.votos - a.votos);
          
          // Solo hay ganador si no hay empate o es segunda ronda
          if (totalVotos > 0 && estado === 'completado') {
            ganador = candidatos[0];
          }
        } else if (tieneCandidatos && estado === 'en_progreso') {
          // Mostrar candidatos con 0 votos si está en progreso
          candidatos = cargo.candidatos.map((candidato: any) => ({
            id_candidato: candidato.id_candidato,
            nombre_completo: candidato.nombre_completo,
            votos: 0,
            porcentaje: 0
          }));
        }
        
        return {
          id_cargo: cargo.id_cargo,
          nombre: cargo.catalogo.nombre,
          candidatos,
          total_votos: totalVotos,
          ganador,
          numero_ronda: rondaConResultados?.numero_ronda || (rondaActiva?.numero_ronda || 1),
          estado,
          tiene_candidatos: tieneCandidatos,
          tiene_ronda_activa: !!rondaActiva
        };
      });
      
      setResultadosPublicos(cargosResultados);
    } catch (error) {
      console.error('Error cargando resultados públicos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadResultadosPublicos();
  }, [electionId]);

  // Configurar actualización automática
  useEffect(() => {
    if (electionId) {
      intervalRef.current = setInterval(() => {
        loadResultadosPublicos();
      }, autoRefreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [electionId, autoRefreshInterval]);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Organizar cargos por estado para mejor visualización
  const cargosSinCandidatos = resultadosPublicos.filter(c => c.estado === 'sin_candidatos');
  const cargosPreparando = resultadosPublicos.filter(c => c.estado === 'preparando');
  const cargosEnProgreso = resultadosPublicos.filter(c => c.estado === 'en_progreso');
  const cargosCompletados = resultadosPublicos.filter(c => c.estado === 'completado');

  // Función para copiar URL pública (siempre solo con electionId)
  const copyPublicUrl = async () => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/realtime/${electionId}`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copiando URL:', err);
    }
  };


  // Función para obtener el color de la barra vertical
  const getBarColor = (candidate: CandidatoResultado, isWinner: boolean | undefined, index: number) => {
    if (isWinner) {
      return 'bg-gradient-to-t from-amber-500 via-yellow-400 to-yellow-300 border-amber-600 shadow-lg shadow-amber-200';
    }
    
    // Colores alternativos para diferentes posiciones
    const colors = [
      'bg-gradient-to-t from-emerald-500 via-green-400 to-green-300 border-emerald-600 shadow-lg shadow-emerald-200',
      'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 border-blue-600 shadow-lg shadow-blue-200',
      'bg-gradient-to-t from-purple-500 via-purple-400 to-purple-300 border-purple-600 shadow-lg shadow-purple-200'
    ];
    
    return colors[index % colors.length];
  };

  // Función para renderizar gráfico de barras verticales (solo para público)
  const renderBarChart = (candidates: CandidatoResultado[], winner: CandidatoResultado | undefined, estado: string) => {
    if (candidates.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-2xl text-gray-500 mb-2">
              {estado === 'sin_candidatos' ? 'Sin candidatos registrados' : 
               estado === 'preparando' ? 'Preparando votación...' : 
               'Esperando resultados...'}
            </p>
            <p className="text-gray-400">Los resultados aparecerán aquí cuando estén disponibles</p>
          </div>
        </div>
      );
    }

    const totalVotes = candidates.reduce((sum, c) => sum + c.votos, 0);
    const sortedCandidates = [...candidates].sort((a, b) => b.votos - a.votos);
    
    return (
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <div className="text-center mb-8">
          <p className="text-gray-600">Total de votos: <span className="font-semibold text-blue-600">{totalVotes}</span></p>
        </div>

        {/* Gráfico de barras verticales - optimizado para 2-3 candidatos */}
        <div className={`grid gap-8 ${
          candidates.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
          candidates.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {sortedCandidates.map((candidate, index) => {
            const isWinner = winner && candidate.id_candidato === winner.id_candidato;
            const barHeight = totalVotes > 0 ? (candidate.votos / totalVotes) * 100 : 0;
            const position = index + 1;
            
            return (
              <div 
                key={candidate.id_candidato} 
                className={`relative group transition-all duration-300 hover:scale-105 ${
                  isWinner ? 'ring-4 ring-amber-200 ring-opacity-50' : ''
                }`}
              >
                {/* Card container */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                  {/* Posición y medalla */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      position === 1 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' :
                      position === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                      position === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                      'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                    }`}>
                      {position}
                    </div>
                    {isWinner && (
                      <div className="flex items-center space-x-1">
                        <span className="text-2xl">🏆</span>
                        <span className="text-xs font-semibold text-amber-600">GANADOR</span>
                      </div>
                    )}
                  </div>

                  {/* Barra vertical mejorada */}
                  <div className="relative h-64 flex flex-col justify-end mb-6">
                    <div className="relative w-full h-full flex flex-col justify-end">
                      {/* Barra principal */}
                      <div 
                        className={`w-full rounded-t-2xl border-2 transition-all duration-1000 ease-out ${getBarColor(candidate, isWinner, index)}`}
                        style={{ 
                          height: `${Math.max(barHeight, candidate.votos === 0 ? 0 : 5)}%`,
                          minHeight: candidate.votos === 0 ? '0px' : '20px'
                        }}
                      >
                        {/* Efecto de brillo en la barra */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-20 rounded-t-2xl"></div>
                      </div>
                      
                      {/* Valor de votos con animación - solo mostrar si hay votos */}
                      {candidate.votos > 0 && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-white rounded-full px-3 py-1 shadow-lg border-2 border-gray-200">
                            <span className="text-lg font-bold text-gray-800">{candidate.votos}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Información del candidato */}
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                      {candidate.nombre_completo}
                    </h3>
                    
                    {/* Porcentaje con barra de progreso horizontal */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl font-bold text-gray-700">
                          {candidate.porcentaje.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Barra de progreso horizontal */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                            isWinner 
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-500'
                          }`}
                          style={{ width: `${candidate.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Función para renderizar badge de estado
  const renderEstadoBadge = (estado: string, numero_ronda?: number) => {
    const badgeClasses = {
      'sin_candidatos': 'bg-gray-100 text-gray-600 border-gray-300',
      'preparando': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'en_progreso': 'bg-blue-100 text-blue-700 border-blue-300',
      'completado': 'bg-green-100 text-green-700 border-green-300'
    };

    const estadoTextos = {
      'sin_candidatos': 'Sin Candidatos',
      'preparando': 'Preparando',
      'en_progreso': numero_ronda && numero_ronda > 1 ? 'Segunda Ronda' : 'En Progreso',
      'completado': 'Completado'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badgeClasses[estado as keyof typeof badgeClasses]}`}>
        {estadoTextos[estado as keyof typeof estadoTextos]}
      </span>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      {/* Header simplificado - solo para admin */}
      {showUrlControls && (
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyPublicUrl}
              className="flex items-center space-x-2"
            >
              {showCopySuccess ? (
                <span className="text-green-600">✓ Copiado</span>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar URL</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header principal simplificado */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-800 mb-2">
            {electionName.toUpperCase() || 'ELECCIÓN'}
          </h1>
          <div className="text-xl md:text-2xl text-blue-600">
            RESULTADOS EN VIVO
          </div>
        </div>

        {/* Resultados con todos los estados */}
        {loading && resultadosPublicos.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
            <p className="text-xl">Cargando resultados...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mostrar TODOS los cargos en orden de progreso */}
            {[...cargosEnProgreso, ...cargosCompletados, ...cargosPreparando, ...cargosSinCandidatos].map((cargo) => {
              const sortedCandidates = cargo.candidatos.sort((a, b) => b.votos - a.votos);
              const winner = cargo.ganador;
              const isCompleted = cargo.estado === 'completado';
              const isInProgress = cargo.estado === 'en_progreso';

              return (
                <div key={cargo.id_cargo} className={`bg-white rounded-xl shadow-lg p-8 border-l-4 ${
                  isCompleted ? 'border-green-500' : 
                  isInProgress ? 'border-blue-500' : 
                  cargo.estado === 'preparando' ? 'border-yellow-500' : 
                  'border-gray-300'
                }`}>
                  {/* Header del cargo con estado */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-0">
                      {cargo.nombre.toUpperCase()}
                    </h2>
                    <div className="flex flex-col items-start md:items-end space-y-2">
                      {renderEstadoBadge(cargo.estado, cargo.numero_ronda)}
                      {cargo.numero_ronda && cargo.numero_ronda > 1 && (
                        <span className="text-sm text-orange-600 font-semibold">
                          Ronda {cargo.numero_ronda}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Contenido según el estado */}
                  {cargo.estado === 'sin_candidatos' ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <p className="text-xl text-gray-500">Sin candidatos registrados</p>
                      <p className="text-sm text-gray-400 mt-2">Esperando registro de candidatos</p>
                    </div>
                  ) : cargo.estado === 'preparando' ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-xl text-gray-600">Preparando votación</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {cargo.candidatos.length} candidato{cargo.candidatos.length !== 1 ? 's' : ''} registrado{cargo.candidatos.length !== 1 ? 's' : ''}
                      </p>
                      {/* Mostrar candidatos sin votos */}
                      <div className="mt-6 space-y-2">
                        {cargo.candidatos.map((candidato: any, index: number) => (
                          <div key={candidato.id_candidato} className="text-lg text-gray-700">
                            {index + 1}. {candidato.nombre_completo}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Barras de votos - FOCO PRINCIPAL */}
                      {renderBarChart(sortedCandidates, winner, cargo.estado)}
                      
                      {/* Información adicional según estado */}
                      {isInProgress && cargo.total_votos === 0 && (
                        <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                          <p className="text-blue-700 font-medium">
                            🗳️ Votación en curso - Esperando primeros votos
                          </p>
                        </div>
                      )}
                      
                      {isInProgress && cargo.total_votos > 0 && cargo.numero_ronda === 1 && (
                        <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                          <p className="text-blue-700 font-medium">
                            📊 Conteo en progreso - Total: {cargo.total_votos} votos
                          </p>
                        </div>
                      )}
                      
                      {/* Ganador destacado si existe */}
                      {isCompleted && winner && (
                        <div className="text-center mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-300">
                          <h3 className="text-2xl md:text-3xl font-bold text-green-800">
                            🏆 GANADOR: {winner.nombre_completo}
                          </h3>
                          <p className="text-green-600 mt-2">
                            {winner.votos} votos ({winner.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Mensaje si no hay cargos */}
            {resultadosPublicos.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <p className="text-2xl text-gray-600">No hay cargos configurados</p>
                <p className="text-gray-500 mt-2">Esperando configuración de la elección</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
