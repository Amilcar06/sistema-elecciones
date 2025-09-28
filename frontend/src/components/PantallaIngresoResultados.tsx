import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Save, Edit, Monitor, RotateCcw } from 'lucide-react';
import { Cargo } from '../services/cargoService';
import { 
  listarCandidatos,
  Candidato 
} from '../services/candidatoService';
import { 
  listarRondas,
  crearRonda,
  declararGanador 
} from '../services/rondaService';
import { 
  listarResultados,
  crearResultado,
  actualizarResultado 
} from '../services/resultadoService';
import { cambiarEstadoEleccion } from '../services/eleccionService';

interface Ronda {
  id_ronda: number;
  id_cargo: number;
  numero_ronda: number;
  fecha: string;
  finalizada: boolean;
  created_at: string;
  updated_at: string;
}

interface Resultado {
  id_resultado: number;
  id_ronda: number;
  id_candidato: number;
  votos: number;
  registrado_por: string;
  created_at: string;
  updated_at: string;
  candidato?: Candidato;
}

interface ResultsEntryProps {
  position: Cargo | null;
  election: any; // Agregar la elección actual
  onUpdatePosition: (position: Cargo) => void;
  onPublicDisplay: () => void;
  onBack: () => void;
  onChangeElectionState: (electionId: number, newState: "DRAFT" | "EN_CURSO" | "FINALIZADA") => Promise<any>;
}

export function PantallaIngresoResultados({ position, election, onUpdatePosition, onPublicDisplay, onBack, onChangeElectionState }: ResultsEntryProps) {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [rondaActual, setRondaActual] = useState<Ronda | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [votes, setVotes] = useState<{ [candidateId: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar datos cuando cambie el cargo
  useEffect(() => {
    if (position) {
      loadData();
    }
  }, [position]);

  const loadData = async () => {
    if (!position) return;
    try {
      setLoading(true);
      
      // Cargar candidatos
      const candidatosData = await listarCandidatos(position.id_cargo);
      setCandidatos(candidatosData);
      
      // Cargar rondas existentes
      const rondasData = await listarRondas(position.id_cargo);
      const rondaActiva = rondasData.find((r: Ronda) => !r.finalizada) || null;
      setRondaActual(rondaActiva);
      
      // Si hay ronda activa, cargar resultados
      if (rondaActiva) {
        const resultadosData = await listarResultados(rondaActiva.id_ronda);
        setResultados(resultadosData);
        
        // Inicializar votos
        const initialVotes: { [candidateId: string]: number } = {};
        candidatosData.forEach((candidato: Candidato) => {
          const resultado = resultadosData.find((r: Resultado) => r.id_candidato === candidato.id_candidato);
          initialVotes[candidato.id_candidato.toString()] = resultado?.votos || 0;
        });
        setVotes(initialVotes);
      } else {
        // Si no hay ronda activa, inicializar votos en 0
        const initialVotes: { [candidateId: string]: number } = {};
        candidatosData.forEach((candidato: Candidato) => {
          initialVotes[candidato.id_candidato.toString()] = 0;
        });
        setVotes(initialVotes);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!position) {
    return null;
  }

  const handleVoteChange = (candidateId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setVotes(prev => ({
      ...prev,
      [candidateId]: Math.max(0, numValue)
    }));
  };

  const saveResults = async () => {
    if (!position || !rondaActual) return;
    
    try {
      setSaving(true);
      
      // Preparar resultados para enviar
      const resultadosData = candidatos.map(candidato => ({
        id_candidato: candidato.id_candidato,
        votos: votes[candidato.id_candidato.toString()] || 0
      }));
      
      // Crear resultados usando la nueva API
      await crearResultado(rondaActual.id_ronda, resultadosData);
      
      // Recargar datos
      await loadData();
      
      alert('Resultados guardados exitosamente');
    } catch (error) {
      console.error('Error guardando resultados:', error);
      alert('Error al guardar resultados');
    } finally {
      setSaving(false);
    }
  };

  const startSecondRound = async () => {
    if (!position || !rondaActual) return;
    
    try {
      setSaving(true);
      
      // Crear segunda ronda
      const nuevaRonda = await crearRonda(
        position.id_cargo,
        rondaActual.numero_ronda + 1,
        new Date().toISOString()
      );
      
      setRondaActual(nuevaRonda);
      
      // Reset votos para la nueva ronda
      const resetVotes: { [candidateId: string]: number } = {};
      candidatos.forEach(candidato => {
        resetVotes[candidato.id_candidato.toString()] = 0;
      });
      setVotes(resetVotes);
      setResultados([]);
      
      alert('Segunda ronda iniciada');
    } catch (error) {
      console.error('Error iniciando segunda ronda:', error);
      alert('Error al iniciar segunda ronda');
    } finally {
      setSaving(false);
    }
  };

  const startFirstRound = async () => {
    if (!position || !election) return;
    
    try {
      setSaving(true);
      
      // Crear primera ronda
      const nuevaRonda = await crearRonda(
        position.id_cargo,
        1,
        new Date().toISOString()
      );
      
      setRondaActual(nuevaRonda);
      
      // Cambiar estado de la elección a EN_CURSO si está en DRAFT
      if (election.estado === 'DRAFT') {
        try {
          await onChangeElectionState(election.id_eleccion, 'EN_CURSO');
          console.log('Estado de elección cambiado a EN_CURSO');
        } catch (error) {
          console.error('Error cambiando estado de elección:', error);
        }
      }
      
      alert('Primera ronda iniciada - Elección en curso');
    } catch (error) {
      console.error('Error iniciando primera ronda:', error);
      alert('Error al iniciar primera ronda');
    } finally {
      setSaving(false);
    }
  };

  const totalVotes = Object.values(votes).reduce((sum, vote) => sum + vote, 0);
  
  // Check for tie
  const voteValues = Object.values(votes);
  const maxVotes = Math.max(...voteValues);
  const winnersCount = voteValues.filter(v => v === maxVotes).length;
  const hasTie = winnersCount > 1 && maxVotes > 0;
  
  // Debug logs
  console.log('Debug - votes:', votes);
  console.log('Debug - voteValues:', voteValues);
  console.log('Debug - maxVotes:', maxVotes);
  console.log('Debug - winnersCount:', winnersCount);
  console.log('Debug - hasTie:', hasTie);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Ingreso de Resultados</h1>
              <p className="text-muted-foreground mt-1">
                CARGO: {position.catalogo?.nombre || 'Cargo'} - {rondaActual ? `Ronda ${rondaActual.numero_ronda}` : 'Sin ronda activa'}
                {rondaActual && rondaActual.numero_ronda > 1 && (
                  <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-semibold">
                    SEGUNDA RONDA
                  </span>
                )}
              </p>
              {election && (
                <p className="text-sm mt-1">
                  Estado de Elección: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    election.estado === 'DRAFT' ? 'bg-gray-200 text-gray-800' :
                    election.estado === 'EN_CURSO' ? 'bg-blue-200 text-blue-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {election.estado === 'DRAFT' ? 'BORRADOR' :
                     election.estado === 'EN_CURSO' ? 'EN CURSO' :
                     'FINALIZADA'}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vote Entry Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ingresar Votos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Cargando candidatos...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {candidatos.map((candidate) => (
                  <div key={candidate.id_candidato} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold">{candidate.nombre_completo.charAt(0)}</span>
                      </div>
                      <Label className="font-semibold text-lg">{candidate.nombre_completo}</Label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="number"
                        min="0"
                        value={votes[candidate.id_candidato.toString()] || 0}
                        onChange={(e) => handleVoteChange(candidate.id_candidato.toString(), e.target.value)}
                        className="w-24 text-center"
                        disabled={!rondaActual}
                      />
                      <span className="text-sm text-muted-foreground w-16">votos</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
              
            {totalVotes > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-semibold">Total de votos: {totalVotes}</p>
                {hasTie && rondaActual && rondaActual.numero_ronda === 1 && (
                  <p className="text-destructive mt-2">
                    ⚠️ Empate detectado - Se requiere segunda ronda
                  </p>
                )}
                {rondaActual && rondaActual.numero_ronda > 1 && (
                  <p className="text-blue-600 mt-2">
                    ℹ️ Segunda ronda en curso - Los resultados de esta ronda serán los definitivos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!rondaActual ? (
            <Button onClick={startFirstRound} className="px-6" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Iniciar Primera Ronda
            </Button>
          ) : (
            <>
              <Button onClick={saveResults} className="px-6" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Resultados'}
              </Button>
              
              {hasTie && totalVotes > 0 && (
                <Button onClick={startSecondRound} variant="outline" className="px-6" disabled={saving}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Iniciar Segunda Ronda
                </Button>
              )}
            </>
          )}
        </div>

        {/* Secondary Actions */}
        {totalVotes > 0 && rondaActual && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button onClick={onPublicDisplay} className="px-6">
              <Monitor className="h-4 w-4 mr-2" />
              Mostrar en Pantalla Pública
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}