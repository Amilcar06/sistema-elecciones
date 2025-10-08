import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Trophy, 
  Users, 
  Home, 
  Eye, 
  ArrowRight,
  Copy,
  Settings,
  BarChart3
} from 'lucide-react';
import { Eleccion } from '../services/eleccionService';
import { Cargo } from '../services/cargoService';
import { getResultadosPublicos } from '../services/eleccionService';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ui/Toast';

// Interfaces unificadas
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

// Props unificadas
interface UnifiedResultsViewProps {
  // Modo de visualización
  mode: 'admin' | 'public';
  
  // Datos de elección (modo admin)
  election?: Eleccion | null;
  currentPosition?: Cargo | null;
  
  // ID de elección (modo público)
  electionId?: number;
  
  // Callbacks (modo admin)
  onNextPosition?: (nextPosition: Cargo | null) => void;
  onBack?: () => void;
  onGoToSummary?: () => void;
  onHome?: () => void;
  
  // Configuración
  autoRefreshInterval?: number;
  showUrlControls?: boolean;
  currentCargoId?: number;
}

export function UnifiedResultsView({
  mode,
  election,
  currentPosition,
  electionId,
  onNextPosition,
  onBack,
  onGoToSummary,
  onHome,
  autoRefreshInterval = mode === 'public' ? 3000 : 5000,
  showUrlControls = false,
  currentCargoId
}: UnifiedResultsViewProps) {
  const [resultadosPublicos, setResultadosPublicos] = useState<CargoResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [electionName, setElectionName] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(mode === 'public');
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const { toasts, addToast, removeToast, success } = useToast();

  // Determinar ID de elección activa
  const activeElectionId = mode === 'admin' ? election?.id_eleccion : electionId;
  const activeCargoId = mode === 'admin' ? currentPosition?.id_cargo : currentCargoId;

  // Función unificada para cargar resultados
  const loadResultadosPublicos = async () => {
    if (!activeElectionId) return;
    
    try {
      setLoading(true);
      const data = await getResultadosPublicos(activeElectionId);
      
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
          ganador = candidatos.length > 0 ? candidatos[0] : undefined;
        }
        
        return {
          id_cargo: cargo.id_cargo,
          nombre: cargo.catalogo.nombre,
          candidatos,
          total_votos: totalVotos,
          ganador,
          numero_ronda: rondaConResultados?.numero_ronda,
          estado,
          tiene_candidatos: tieneCandidatos,
          tiene_ronda_activa: !!rondaActiva
        };
      });
      
      setResultadosPublicos(cargosResultados);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando resultados:', error);
      addToast({
        title: 'Error',
        message: 'No se pudieron cargar los resultados',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadResultadosPublicos();
  }, [activeElectionId]);

  useEffect(() => {
    if (autoRefresh && activeElectionId) {
      intervalRef.current = window.setInterval(loadResultadosPublicos, autoRefreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, activeElectionId, autoRefreshInterval]);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Funciones auxiliares
  const getEstadoBadge = (estado: string) => {
    const variants = {
      preparando: 'secondary',
      en_progreso: 'default',
      completado: 'destructive',
      sin_candidatos: 'outline'
    } as const;

    const labels = {
      preparando: 'Preparando',
      en_progreso: 'En Progreso',
      completado: 'Completado',
      sin_candidatos: 'Sin Candidatos'
    };

    return <Badge variant={variants[estado as keyof typeof variants]}>{labels[estado as keyof typeof labels]}</Badge>;
  };

  const copyUrlToClipboard = async () => {
    try {
      const url = `${window.location.origin}/realtime/${activeElectionId}`;
      await navigator.clipboard.writeText(url);
      setShowCopySuccess(true);
      success('URL copiada', 'La URL pública ha sido copiada al portapapeles');
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copiando URL:', error);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Renderizado condicional según el modo
  if (mode === 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Admin */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Visualización de Resultados</h1>
                <p className="text-muted-foreground mt-1">
                  {election?.nombre} - {election?.fecha ? new Date(election.fecha).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={toggleAutoRefresh}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </Button>
              
              {showUrlControls && (
                <Button variant="outline" size="sm" onClick={copyUrlToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar URL
                </Button>
              )}
              
              <Button variant="outline" onClick={onHome}>
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </div>
          </div>

          {/* Contenido de resultados */}
          <ResultsContent 
            resultados={resultadosPublicos}
            loading={loading}
            isOnline={isOnline}
            lastUpdate={lastUpdate}
            activeCargoId={activeCargoId}
            mode="admin"
            onNextPosition={onNextPosition}
            onGoToSummary={onGoToSummary}
          />
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  // Modo público
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Público */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-gray-900">Resultados en Tiempo Real</h1>
            </div>
            <h2 className="text-2xl text-gray-700 mb-2">{electionName}</h2>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>{isOnline ? 'Conectado' : 'Desconectado'}</span>
              </div>
              <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Contenido de resultados */}
          <ResultsContent 
            resultados={resultadosPublicos}
            loading={loading}
            isOnline={isOnline}
            lastUpdate={lastUpdate}
            activeCargoId={activeCargoId}
            mode="public"
          />
        </div>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  );
}

// Componente de contenido de resultados reutilizable
interface ResultsContentProps {
  resultados: CargoResultado[];
  loading: boolean;
  isOnline: boolean;
  lastUpdate: Date;
  activeCargoId?: number;
  mode: 'admin' | 'public';
  onNextPosition?: (nextPosition: Cargo | null) => void;
  onGoToSummary?: () => void;
}

function ResultsContent({
  resultados,
  loading,
  isOnline,
  lastUpdate,
  activeCargoId,
  mode,
  onNextPosition,
  onGoToSummary
}: ResultsContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (resultados.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay resultados disponibles</h3>
          <p className="text-muted-foreground">
            Los resultados aparecerán aquí una vez que se registren votos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {resultados.map((cargo, index) => (
        <Card 
          key={cargo.id_cargo} 
          className={`transition-all duration-200 ${
            activeCargoId === cargo.id_cargo ? 'ring-2 ring-primary shadow-lg' : ''
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-xl">{cargo.nombre}</CardTitle>
                  {cargo.numero_ronda && (
                    <p className="text-sm text-muted-foreground">
                      Ronda {cargo.numero_ronda}
                    </p>
                  )}
                </div>
              </div>
              {getEstadoBadge(cargo.estado)}
            </div>
          </CardHeader>
          
          <CardContent>
            {cargo.candidatos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No hay candidatos registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Ganador destacado */}
                {cargo.ganador && cargo.estado === 'completado' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Ganador</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {cargo.ganador.nombre_completo}
                    </p>
                    <p className="text-sm text-green-700">
                      {cargo.ganador.votos} votos ({cargo.ganador.porcentaje.toFixed(1)}%)
                    </p>
                  </div>
                )}
                
                {/* Lista de candidatos */}
                <div className="space-y-2">
                  {cargo.candidatos.map((candidato, idx) => (
                    <div 
                      key={candidato.id_candidato}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        idx === 0 && cargo.estado === 'completado' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          idx === 0 && cargo.estado === 'completado'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-medium">{candidato.nombre_completo}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{candidato.votos} votos</div>
                        <div className="text-sm text-muted-foreground">
                          {candidato.porcentaje.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total de votos */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total de votos: <span className="font-semibold">{cargo.total_votos}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Botones de navegación (solo modo admin) */}
      {mode === 'admin' && (
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onGoToSummary}>
            <Eye className="h-4 w-4 mr-2" />
            Ver Resumen Final
          </Button>
          <Button onClick={() => onNextPosition?.(null)}>
            Siguiente Cargo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Función auxiliar para badges de estado
function getEstadoBadge(estado: string) {
  const variants = {
    preparando: 'secondary',
    en_progreso: 'default',
    completado: 'destructive',
    sin_candidatos: 'outline'
  } as const;

  const labels = {
    preparando: 'Preparando',
    en_progreso: 'En Progreso',
    completado: 'Completado',
    sin_candidatos: 'Sin Candidatos'
  };

  return (
    <Badge variant={variants[estado as keyof typeof variants]}>
      {labels[estado as keyof typeof labels]}
    </Badge>
  );
}
