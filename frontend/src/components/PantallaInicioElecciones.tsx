import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Vote, History, Plus } from 'lucide-react';

interface HomeScreenProps {
  onCreateElection: (data: { nombre: string; descripcion?: string }) => void;
  onViewHistory: () => void;
}

export function PantallaInicioElecciones({ onCreateElection, onViewHistory }: HomeScreenProps) {
  const [electionName, setElectionName] = useState('');
  const [electionDescription, setElectionDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

const handleCreateElection = async () => {
  if (electionName.trim()) {
    try {
      onCreateElection({
        nombre: electionName.trim(),
        descripcion: electionDescription.trim() || undefined
      });
      setElectionName('');
      setElectionDescription('');
      setIsDialogOpen(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear la elección");
    }
  }
};

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Vote className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold text-primary">ELECCIONES ACADÉMICAS 2025</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Sistema de gestión para elecciones estudiantiles
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Nueva Elección</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crear y configurar una nueva elección académica
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Elección</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="election-name">Nombre de la Elección</Label>
                  <Input
                    id="election-name"
                    placeholder="Ej: Elecciones Generales 2025"
                    value={electionName}
                    onChange={(e) => setElectionName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateElection()}
                  />
                </div>
                <div>
                  <Label htmlFor="election-description">Descripción (Opcional)</Label>
                  <Input
                    id="election-description"
                    placeholder="Ej: Elecciones para el período académico 2025-2026"
                    value={electionDescription}
                    onChange={(e) => setElectionDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateElection} disabled={!electionName.trim()}>
                    Crear Elección
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20"
            onClick={onViewHistory}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Ver Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Consultar resultados de elecciones anteriores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Gestión Completa</h3>
            <p className="text-sm text-muted-foreground">
              Administra cargos, candidatos y resultados en un solo lugar
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Resultados en Tiempo Real</h3>
            <p className="text-sm text-muted-foreground">
              Visualiza y proyecta resultados conforme se van ingresando
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Historial Completo</h3>
            <p className="text-sm text-muted-foreground">
              Mantén un registro de todas las elecciones realizadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}