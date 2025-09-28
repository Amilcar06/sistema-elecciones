import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Plus, X, ArrowLeft, Users, ArrowRight } from "lucide-react";

import { Eleccion } from "../services/eleccionService";
import {
  Cargo,
  getCargos,
  crearCargo,
  eliminarCargo,
} from "../services/cargoService";
import { listarCatalogos } from "../services/catalogoCargoService";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CatalogoCargo {
  id_catalogo: number;
  nombre: string;
  descripcion?: string;
}

interface PositionManagementProps {
  election: Eleccion | null;
  onUpdateElection: (election: Eleccion) => void;
  onContinue: (position: Cargo) => void;
  onBack: () => void;
}

export function PantallaGestionCargos({
  election,
  onContinue,
  onBack,
}: PositionManagementProps) {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogoCargo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Campos de formulario
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState<string>("");

  // Cargar cargos y catálogos
  useEffect(() => {
    if (election) {
      getCargos(election.id_eleccion)
        .then(setCargos)
        .catch(console.error);
      listarCatalogos().then(setCatalogos).catch(console.error);
    }
  }, [election]);

  if (!election) return null;

  const addCargo = async () => {
    if (!catalogoSeleccionado) return;

    try {
      const nuevoCargo = await crearCargo({
        id_eleccion: election.id_eleccion,
        id_catalogo: Number(catalogoSeleccionado),
        orden: cargos.length + 1,
        estado: "PENDIENTE",
      });
      setCargos((prev) => [...prev, nuevoCargo]);
      resetForm();
    } catch (err) {
      console.error("Error creando cargo", err);
    }
  };

  const deleteCargo = async (id_cargo: number) => {
    try {
      await eliminarCargo(id_cargo);
      setCargos((prev) => prev.filter((c) => c.id_cargo !== id_cargo));
    } catch (err) {
      console.error("Error eliminando cargo", err);
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setCatalogoSeleccionado("");
  };

  const getStatusBadge = (estado: Cargo["estado"]) => {
    const variants = {
      PENDIENTE: "secondary",
      EN_PROCESO: "default",
      FINALIZADO: "destructive",
    } as const;

    const labels = {
      PENDIENTE: "Pendiente",
      EN_PROCESO: "En Proceso",
      FINALIZADO: "Completado",
    };

    return <Badge variant={variants[estado]}>{labels[estado]}</Badge>;
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
              <h1 className="text-3xl font-bold">Gestión de Cargos</h1>
              <p className="text-muted-foreground mt-1">
                ELECCIÓN: "{election.nombre}" - Fecha:{" "}
                {new Date(election.fecha).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Positions List */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Cargos Definidos</span>
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cargo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Cargo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Catálogo */}
                    <div>
                      <Label>Seleccionar del Catálogo</Label>
                      <Select
                        value={catalogoSeleccionado}
                        onValueChange={setCatalogoSeleccionado}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cargo del catálogo" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogos.map((c) => (
                            <SelectItem
                              key={c.id_catalogo}
                              value={String(c.id_catalogo)}
                            >
                              {c.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* El nombre se toma del catálogo seleccionado */}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={addCargo}
                        disabled={!catalogoSeleccionado}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {cargos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay cargos definidos aún</p>
                <p className="text-sm">Agrega el primer cargo para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cargos.map((cargo, index) => (
                  <div
                    key={cargo.id_cargo}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-lg">{index + 1}.</span>
                      <div>
                        <h3 className="font-semibold">{cargo.catalogo?.nombre || 'Cargo'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cargo.candidatos?.length ?? 0} candidatos registrados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(cargo.estado)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCargo(cargo.id_cargo)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onContinue(cargo)}
                      >
                        Continuar <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
