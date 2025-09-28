import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Edit, X, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { Cargo } from '../services/cargoService';
import { 
  listarCandidatos, 
  crearCandidato, 
  actualizarCandidato, 
  eliminarCandidato,
  Candidato
} from '../services/candidatoService';

interface CandidateRegistrationProps {
  position: Cargo | null;
  onUpdatePosition: (position: Cargo) => void;
  onStartVoting: () => void;
  onBack: () => void;
}

export function PantallaRegistroCandidatos({ position, onUpdatePosition, onStartVoting, onBack }: CandidateRegistrationProps) {
  const [candidateName, setCandidateName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidato | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar candidatos cuando cambie el cargo
  useEffect(() => {
    if (position) {
      loadCandidatos();
    }
  }, [position]);

  const loadCandidatos = async () => {
    if (!position) return;
    try {
      setLoading(true);
      const data = await listarCandidatos(position.id_cargo);
      setCandidatos(data);
    } catch (error) {
      console.error('Error cargando candidatos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!position) {
    return null;
  }

  const addCandidate = async () => {
    if (candidateName.trim() && position) {
      try {
        setLoading(true);
        const nuevoCandidato = await crearCandidato(
          position.id_cargo,
          candidateName.trim()
        );
        setCandidatos(prev => [...prev, nuevoCandidato]);
        setCandidateName('');
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error creando candidato:', error);
        alert('Error al crear candidato');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateCandidate = async () => {
    if (editingCandidate && candidateName.trim() && position) {
      try {
        setLoading(true);
        const candidatoActualizado = await actualizarCandidato(
          editingCandidate.id_candidato,
          position.id_cargo,
          candidateName.trim()
        );
        setCandidatos(prev => prev.map(c => 
          c.id_candidato === editingCandidate.id_candidato ? candidatoActualizado : c
        ));
        setCandidateName('');
        setEditingCandidate(null);
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Error actualizando candidato:', error);
        alert('Error al actualizar candidato');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteCandidate = async (candidatoId: number) => {
    try {
      setLoading(true);
      await eliminarCandidato(candidatoId);
      setCandidatos(prev => prev.filter(c => c.id_candidato !== candidatoId));
    } catch (error) {
      console.error('Error eliminando candidato:', error);
      alert('Error al eliminar candidato');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (candidate: Candidato) => {
    setEditingCandidate(candidate);
    setCandidateName(candidate.nombre_completo);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCandidate(null);
    setCandidateName('');
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCandidate(null);
    setCandidateName('');
  };

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
              <h1 className="text-3xl font-bold">Registro de Candidatos</h1>
              <p className="text-muted-foreground mt-1">
                CARGO: {position.catalogo?.nombre || 'Cargo'}
              </p>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Lista de Candidatos</span>
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Candidato
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCandidate ? 'Editar Candidato' : 'Agregar Nuevo Candidato'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="candidate-name">Nombre Completo</Label>
                      <Input
                        id="candidate-name"
                        placeholder="Ej: Juan Pérez López"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (editingCandidate ? updateCandidate() : addCandidate())}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleDialogClose}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={editingCandidate ? updateCandidate : addCandidate}
                        disabled={!candidateName.trim()}
                      >
                        {editingCandidate ? 'Actualizar' : 'Agregar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Cargando candidatos...</p>
              </div>
            ) : candidatos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay candidatos registrados aún</p>
                <p className="text-sm">Agrega al menos un candidato para continuar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidatos.map((candidate, index) => (
                  <div key={candidate.id_candidato} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{candidate.nombre_completo}</h3>
                        <p className="text-sm text-muted-foreground">
                          Candidato #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(candidate)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCandidate(candidate.id_candidato)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Voting Button */}
        {candidatos.length > 0 && (
          <div className="flex justify-center">
            <Button 
              onClick={onStartVoting}
              className="px-8 py-3"
            >
              Iniciar Votación para este Cargo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}