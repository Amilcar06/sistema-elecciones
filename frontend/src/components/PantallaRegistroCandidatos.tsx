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
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ui/Toast';

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
  const [nameError, setNameError] = useState('');
  
  // Hook de toast
  const { toasts, success, error, removeToast } = useToast();

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
    } catch (err) {
      console.error('Error cargando candidatos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!position) {
    return null;
  }

  const validateName = (name: string): boolean => {
    // Solo permite letras, espacios, acentos y caracteres especiales del español
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return nameRegex.test(name);
  };

  const handleNameChange = (value: string) => {
    setCandidateName(value);
    
    if (value.trim() === '') {
      setNameError('');
      return;
    }
    
    if (!validateName(value)) {
      setNameError('El nombre solo puede contener letras y espacios');
    } else if (value.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
    } else {
      setNameError('');
    }
  };

  const addCandidate = async () => {
    const trimmedName = candidateName.trim();
    
    if (!trimmedName || !position) return;
    
    if (!validateName(trimmedName)) {
      setNameError('El nombre solo puede contener letras y espacios');
      return;
    }
    
    if (trimmedName.length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    try {
      setLoading(true);
      const nuevoCandidato = await crearCandidato(
        position.id_cargo,
        trimmedName
      );
      setCandidatos(prev => [...prev, nuevoCandidato]);
      setCandidateName('');
      setNameError('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error creando candidato:', err);
      error('Error al crear candidato', 'No se pudo crear el candidato. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = async () => {
    const trimmedName = candidateName.trim();
    
    if (!editingCandidate || !trimmedName || !position) return;
    
    if (!validateName(trimmedName)) {
      setNameError('El nombre solo puede contener letras y espacios');
      return;
    }
    
    if (trimmedName.length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    try {
      setLoading(true);
      const candidatoActualizado = await actualizarCandidato(
        editingCandidate.id_candidato,
        position.id_cargo,
        trimmedName
      );
      setCandidatos(prev => prev.map(c => 
        c.id_candidato === editingCandidate.id_candidato ? candidatoActualizado : c
      ));
      setCandidateName('');
      setNameError('');
      setEditingCandidate(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error actualizando candidato:', err);
      error('Error al actualizar candidato', 'No se pudo actualizar el candidato. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (candidatoId: number) => {
    try {
      setLoading(true);
      await eliminarCandidato(candidatoId);
      setCandidatos(prev => prev.filter(c => c.id_candidato !== candidatoId));
    } catch (err) {
      console.error('Error eliminando candidato:', err);
      error('Error al eliminar candidato', 'No se pudo eliminar el candidato. Inténtalo de nuevo.');
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
    setNameError('');
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
                <DialogContent aria-describedby="candidate-dialog-description">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCandidate ? 'Editar Candidato' : 'Agregar Nuevo Candidato'}
                    </DialogTitle>
                  </DialogHeader>
                  <p id="candidate-dialog-description" className="sr-only">
                    {editingCandidate ? 'Edita la información del candidato seleccionado' : 'Ingresa la información del nuevo candidato para este cargo'}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="candidate-name">Nombre Completo</Label>
                      <Input
                        id="candidate-name"
                        placeholder="Ej: Juan Pérez López"
                        value={candidateName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !nameError && candidateName.trim() && (editingCandidate ? updateCandidate() : addCandidate())}
                        className={nameError ? 'border-red-500' : ''}
                      />
                      {nameError && (
                        <p className="text-red-500 text-sm mt-1">{nameError}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleDialogClose}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={editingCandidate ? updateCandidate : addCandidate}
                        disabled={!candidateName.trim() || !!nameError}
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
                        aria-label={`Editar candidato ${candidate.nombre_completo}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCandidate(candidate.id_candidato)}
                        disabled={loading}
                        aria-label={`Eliminar candidato ${candidate.nombre_completo}`}
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
        <div className="flex flex-col items-center space-y-4">
          {candidatos.length < 2 && candidatos.length > 0 && (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                Se necesitan al menos 2 candidatos para iniciar la votación
              </p>
            </div>
          )}
          
          {candidatos.length >= 2 && (
            <Button 
              onClick={onStartVoting}
              className="px-8 py-3"
            >
              Iniciar Votación para este Cargo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}