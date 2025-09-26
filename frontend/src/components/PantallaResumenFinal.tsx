import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ArrowLeft, Home, Download, FileText, Trophy, Calendar } from 'lucide-react';
import { Eleccion } from '../services/eleccionService';
import { 
  getResumenFinal,
  generarReporte,
  cambiarEstadoEleccion 
} from '../services/eleccionService';

interface GanadorFinal {
  id_cargo: number;
  nombre_cargo: string;
  orden: number;
  id_candidato: number;
  nombre_candidato: string;
  votos: number;
  porcentaje: string; // El backend devuelve string
  numero_ronda: number;
  eleccion_nombre: string;
  fecha: string;
}

interface FinalSummaryProps {
  election: Eleccion | null;
  onBack: () => void;
  onHome: () => void;
  onChangeElectionState: (electionId: number, newState: "DRAFT" | "EN_CURSO" | "FINALIZADA") => Promise<any>;
}

export function PantallaResumenFinal({ election, onBack, onHome, onChangeElectionState }: FinalSummaryProps) {
  const [ganadores, setGanadores] = useState<GanadorFinal[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Cargar resumen final cuando cambie la elección
  useEffect(() => {
    if (election) {
      loadResumenFinal();
    }
  }, [election]);

  const loadResumenFinal = async () => {
    if (!election) return;
    try {
      setLoading(true);
      const data = await getResumenFinal(election.id_eleccion);
      setGanadores(data);
      
      // Cambiar estado de la elección a FINALIZADA si está en EN_CURSO
      if (election.estado === 'EN_CURSO') {
        try {
          await onChangeElectionState(election.id_eleccion, 'FINALIZADA');
          console.log('Estado de elección cambiado a FINALIZADA');
        } catch (error) {
          console.error('Error cambiando estado de elección:', error);
        }
      }
    } catch (error) {
      console.error('Error cargando resumen final:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = async (formato: string) => {
    if (!election) return;
    try {
      setGeneratingReport(true);
      const reporte = await generarReporte(election.id_eleccion, formato);
      
      // Crear contenido del reporte como JSON
      const contenido = JSON.stringify(reporte.datos, null, 2);
      
      // Crear enlace de descarga
      const blob = new Blob([contenido], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_eleccion_${election.id_eleccion}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Reporte ${formato.toUpperCase()} generado exitosamente`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar reporte');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (!election) {
    return null;
  }

  const totalVotes = ganadores.reduce((sum, ganador) => sum + ganador.votos, 0);

  const generatePDFReport = () => {
    handleGenerarReporte('pdf');
  };

  const exportToExcel = () => {
    handleGenerarReporte('xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-primary">Resumen Final</h1>
              <p className="text-xl text-muted-foreground mt-1">
                {election.nombre}
              </p>
              <p className="text-sm mt-2">
                Estado de Elección: 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  election.estado === 'DRAFT' ? 'bg-gray-200 text-gray-800' :
                  election.estado === 'EN_CURSO' ? 'bg-blue-200 text-blue-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {election.estado === 'DRAFT' ? 'BORRADOR' :
                   election.estado === 'EN_CURSO' ? 'EN CURSO' :
                   'FINALIZADA'}
                </span>
              </p>
            </div>
          </div>
          <Button onClick={onHome} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
        </div>

        {/* Election Overview */}
        <Card className="mb-8 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>{election.nombre.toUpperCase()} - RESUMEN FINAL</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold mb-1">Fecha</h3>
                <p className="text-lg">{new Date(election.fecha).toLocaleDateString()}</p>
              </div>
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold mb-1">Cargos Electos</h3>
                <p className="text-lg">{ganadores.length}</p>
              </div>
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold mb-1">Total Votos</h3>
                <p className="text-lg">{totalVotes}</p>
              </div>
            </div>

            {/* Winners List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Ganadores Electos</h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Cargando ganadores...</p>
                </div>
              ) : ganadores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay resultados completados aún</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ganadores.map((ganador, index) => (
                    <Card key={ganador.id_cargo} className="border-2 border-yellow-200 bg-yellow-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-yellow-800">
                                {ganador.nombre_cargo}: {ganador.nombre_candidato}
                              </h3>
                              <div className="flex items-center space-x-4 text-yellow-700 mt-1">
                                <span>{ganador.votos} votos ({parseFloat(ganador.porcentaje).toFixed(1)}%)</span>
                                {ganador.numero_ronda > 1 && (
                                  <span className="text-sm bg-yellow-200 px-2 py-1 rounded">
                                    Ronda {ganador.numero_ronda}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-600">#{index + 1}</div>
                          </div>
                        </div>

                        {/* Winner details */}
                        <div className="mt-4 pt-4 border-t border-yellow-200">
                          <div className="text-sm text-yellow-700">
                            <p><strong>Ganador:</strong> {ganador.nombre_candidato}</p>
                            <p><strong>Votos obtenidos:</strong> {ganador.votos} ({parseFloat(ganador.porcentaje).toFixed(1)}%)</p>
                            <p><strong>Ronda:</strong> {ganador.numero_ronda}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={generatePDFReport} 
            size="lg" 
            className="px-8"
            disabled={generatingReport}
          >
            <FileText className="h-4 w-4 mr-2" />
            {generatingReport ? 'Generando...' : 'Generar Reporte PDF'}
          </Button>
          <Button 
            onClick={exportToExcel} 
            variant="outline" 
            size="lg" 
            className="px-8"
            disabled={generatingReport}
          >
            <Download className="h-4 w-4 mr-2" />
            {generatingReport ? 'Generando...' : 'Exportar Excel'}
          </Button>
        </div>

        {/* Additional Info */}
        <Card className="mt-8 bg-white/50">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Esta elección ha sido completada exitosamente. Los resultados han sido guardados en el historial del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}