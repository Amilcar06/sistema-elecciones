import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { ToastContainer } from './ui/Toast';
import { AnimatedCard, StaggeredAnimation } from './ui/AnimatedCard';
import { Vote, History, Plus, Settings, BarChart3 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface HomeScreenProps {
  onCreateElection: (data: { nombre: string; descripcion?: string }) => void;
  onViewHistory: () => void;
}

export function PantallaInicioElecciones({ onCreateElection, onViewHistory }: HomeScreenProps) {
  const [electionName, setElectionName] = useState('');
  const [electionDescription, setElectionDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

const handleCreateElection = async () => {
  if (electionName.trim()) {
    setIsCreating(true);
    try {
      await onCreateElection({
        nombre: electionName.trim(),
        descripcion: electionDescription.trim() || undefined
      });
      setElectionName('');
      setElectionDescription('');
      setIsDialogOpen(false);
      success(
        'Elección creada exitosamente',
        'La nueva elección ha sido configurada correctamente'
      );
    } catch (e) {
      console.error(e);
      error(
        'Error al crear elección',
        'No se pudo crear la elección. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsCreating(false);
    }
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header con mejor jerarquía visual */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-8">
              <Vote className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              SISTEMA DE ELECCIONES
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Plataforma integral para gestionar elecciones de manera transparente y eficiente
            </p>
          </div>

          {/* Main Actions con mejor jerarquía */}
          <StaggeredAnimation 
            className="grid sm:grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20"
            staggerDelay={200}
          >
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-6 pt-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center mb-2">Crear Elección</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground text-base leading-relaxed">
                      Configurar una nueva elección con cargos, candidatos y parámetros necesarios
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold">Nueva Elección</DialogTitle>
                <p className="text-muted-foreground">
                  Configura los parámetros básicos para tu elección
                </p>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="election-name" className="text-sm font-medium">
                    Nombre de la Elección *
                  </Label>
                  <Input
                    id="election-name"
                    placeholder="Ej: Elecciones Generales 2025"
                    value={electionName}
                    onChange={(e) => setElectionName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateElection()}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="election-description" className="text-sm font-medium">
                    Descripción (Opcional)
                  </Label>
                  <Input
                    id="election-description"
                    placeholder="Ej: Elecciones para la mesa directiva 2025-2026"
                    value={electionDescription}
                    onChange={(e) => setElectionDescription(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 h-11"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateElection} 
                    disabled={!electionName.trim() || isCreating}
                    className="flex-1 h-11"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      'Crear Elección'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 hover:-translate-y-1 bg-card/50 backdrop-blur-sm"
              onClick={onViewHistory}
            >
              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <History className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center mb-2">Historial</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-base leading-relaxed">
                  Consultar resultados y estadísticas de elecciones realizadas
                </p>
              </CardContent>
            </Card>
          </StaggeredAnimation>

          {/* Features con mejor jerarquía visual */}
          <AnimatedCard delay={400}>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Funcionalidades del Sistema
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Herramientas especializadas para una gestión electoral eficiente y transparente
              </p>
            </div>
          </AnimatedCard>
          
          <StaggeredAnimation 
            className="grid sm:grid-cols-1 md:grid-cols-3 gap-8"
            staggerDelay={150}
          >
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Configuración Electoral</h3>
              <p className="text-muted-foreground leading-relaxed">
                Administra cargos, candidatos y parámetros de elección con herramientas intuitivas
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Resultados en Vivo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualiza y proyecta resultados conforme se van ingresando con actualizaciones automáticas
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Registro Histórico</h3>
              <p className="text-muted-foreground leading-relaxed">
                Consulta el historial completo de elecciones con análisis estadísticos detallados
              </p>
            </div>
          </StaggeredAnimation>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}