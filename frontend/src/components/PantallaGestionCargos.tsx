import React, { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { Plus, X, ArrowLeft, Users, ArrowRight, Link, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./ui/Toast";

import { Eleccion } from "../services/eleccionService";
import {
  Cargo,
  getCargos,
  crearCargo,
  eliminarCargo,
} from "../services/cargoService";
import { 
  listarCatalogos, 
  crearCatalogo, 
  actualizarCatalogo,
  eliminarCatalogo 
} from "../services/catalogoCargoService";
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
  const [isCreateCatalogDialogOpen, setIsCreateCatalogDialogOpen] = useState(false);
  const [isEditCatalogDialogOpen, setIsEditCatalogDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast, success, error } = useToast();

  // Campos de formulario
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState<string>("");
  
  // Campos para crear nuevo catálogo
  const [nuevoCatalogoNombre, setNuevoCatalogoNombre] = useState<string>("");
  const [nuevoCatalogoDescripcion, setNuevoCatalogoDescripcion] = useState<string>("");
  
  // Campos para editar catálogo
  const [editingCatalogo, setEditingCatalogo] = useState<CatalogoCargo | null>(null);
  const [editCatalogoNombre, setEditCatalogoNombre] = useState<string>("");
  const [editCatalogoDescripcion, setEditCatalogoDescripcion] = useState<string>("");
  
  // Validaciones
  const [nombreError, setNombreError] = useState<string>("");
  const [editNombreError, setEditNombreError] = useState<string>("");

  // Cargar cargos y catálogos
  useEffect(() => {
    if (election) {
      loadData();
    }
  }, [election]);

  const loadData = async () => {
    if (!election) return;
    try {
      setLoading(true);
      const [cargosData, catalogosData] = await Promise.all([
        getCargos(election.id_eleccion),
        listarCatalogos()
      ]);
      setCargos(cargosData);
      setCatalogos(catalogosData);
    } catch (err) {
      console.error("Error cargando datos", err);
      error("Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  if (!election) return null;

  // Validaciones
  const validateNombre = (nombre: string): boolean => {
    if (!nombre.trim()) {
      setNombreError("El nombre es requerido");
      return false;
    }
    if (nombre.trim().length < 2) {
      setNombreError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    if (catalogos.some(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      setNombreError("Ya existe un cargo con este nombre");
      return false;
    }
    setNombreError("");
    return true;
  };

  const validateEditNombre = (nombre: string, catalogoId: number): boolean => {
    if (!nombre.trim()) {
      setEditNombreError("El nombre es requerido");
      return false;
    }
    if (nombre.trim().length < 2) {
      setEditNombreError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    if (catalogos.some(c => c.id_catalogo !== catalogoId && c.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      setEditNombreError("Ya existe un cargo con este nombre");
      return false;
    }
    setEditNombreError("");
    return true;
  };

  const addCargo = async () => {
    if (!catalogoSeleccionado) return;

    try {
      setLoading(true);
      const nuevoCargo = await crearCargo({
        id_eleccion: election.id_eleccion,
        id_catalogo: Number(catalogoSeleccionado),
        orden: cargos.length + 1,
        estado: "PENDIENTE",
      });
      setCargos((prev) => [...prev, nuevoCargo]);
      resetForm();
      success("Éxito", "Cargo agregado correctamente");
    } catch (err) {
      console.error("Error creando cargo", err);
      error("Error", "No se pudo agregar el cargo");
    } finally {
      setLoading(false);
    }
  };

  const deleteCargo = async (id_cargo: number, cargoNombre: string) => {
    try {
      setLoading(true);
      await eliminarCargo(id_cargo);
      setCargos((prev) => prev.filter((c) => c.id_cargo !== id_cargo));
      success("Éxito", `Cargo "${cargoNombre}" eliminado correctamente`);
    } catch (err) {
      console.error("Error eliminando cargo", err);
      error("Error", "No se pudo eliminar el cargo");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setCatalogoSeleccionado("");
  };

  const resetCreateCatalogForm = () => {
    setIsCreateCatalogDialogOpen(false);
    setNuevoCatalogoNombre("");
    setNuevoCatalogoDescripcion("");
    setNombreError("");
  };

  const resetEditCatalogForm = () => {
    setIsEditCatalogDialogOpen(false);
    setEditingCatalogo(null);
    setEditCatalogoNombre("");
    setEditCatalogoDescripcion("");
    setEditNombreError("");
  };

  const createNewCatalog = async () => {
    if (!validateNombre(nuevoCatalogoNombre)) return;

    try {
      setLoading(true);
      const nuevoCatalogo = await crearCatalogo(
        nuevoCatalogoNombre.trim(),
        nuevoCatalogoDescripcion.trim() || undefined
      );
      setCatalogos((prev) => [...prev, nuevoCatalogo]);
      resetCreateCatalogForm();
      success("Éxito", "Cargo creado correctamente");
    } catch (err) {
      console.error("Error creando catálogo", err);
      error("Error", "No se pudo crear el cargo");
    } finally {
      setLoading(false);
    }
  };

  const editCatalog = async () => {
    if (!editingCatalogo || !validateEditNombre(editCatalogoNombre, editingCatalogo.id_catalogo)) return;

    try {
      setLoading(true);
      const catalogoActualizado = await actualizarCatalogo(
        editingCatalogo.id_catalogo,
        editCatalogoNombre.trim(),
        editCatalogoDescripcion.trim() || undefined
      );
      setCatalogos((prev) => 
        prev.map(c => c.id_catalogo === editingCatalogo.id_catalogo ? catalogoActualizado : c)
      );
      resetEditCatalogForm();
      success("Éxito", "Cargo actualizado correctamente");
    } catch (err) {
      console.error("Error actualizando catálogo", err);
      error("Error", "No se pudo actualizar el cargo");
    } finally {
      setLoading(false);
    }
  };

  const deleteCatalog = async (id_catalogo: number, catalogoNombre: string) => {
    try {
      setLoading(true);
      await eliminarCatalogo(id_catalogo);
      setCatalogos((prev) => prev.filter((c) => c.id_catalogo !== id_catalogo));
      success("Éxito", `Cargo "${catalogoNombre}" eliminado del catálogo`);
    } catch (err) {
      console.error("Error eliminando catálogo", err);
      error("Error", "No se pudo eliminar el cargo del catálogo");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (catalogo: CatalogoCargo) => {
    setEditingCatalogo(catalogo);
    setEditCatalogoNombre(catalogo.nombre);
    setEditCatalogoDescripcion(catalogo.descripcion || "");
    setIsEditCatalogDialogOpen(true);
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
              <p className="text-sm mt-1">
                Estado: 
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
            </div>
          </div>
          
          {/* Botón URL Pública - Solo visible cuando la elección no está finalizada */}
          {election.estado !== 'FINALIZADA' && (
            <Button 
              variant="outline" 
              onClick={() => window.open(`/realtime/${election.id_eleccion}`, '_blank')}
              className="flex items-center space-x-2"
            >
              <Link className="h-4 w-4" />
              <span>URL Pública</span>
            </Button>
          )}
        </div>

        {/* Positions List */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Cargos Definidos</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Dialog open={isCreateCatalogDialogOpen} onOpenChange={setIsCreateCatalogDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Cargo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Cargo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre del Cargo</Label>
                        <Input
                          id="nombre"
                          value={nuevoCatalogoNombre}
                          onChange={(e) => {
                            setNuevoCatalogoNombre(e.target.value);
                            if (nombreError) setNombreError("");
                          }}
                          placeholder="Ej: Presidente, Secretario, etc."
                          className={nombreError ? "border-destructive" : ""}
                        />
                        {nombreError && (
                          <p className="text-sm text-destructive mt-1">{nombreError}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="descripcion">Descripción (opcional)</Label>
                        <Input
                          id="descripcion"
                          value={nuevoCatalogoDescripcion}
                          onChange={(e) => setNuevoCatalogoDescripcion(e.target.value)}
                          placeholder="Descripción del cargo..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={resetCreateCatalogForm}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={createNewCatalog}
                          disabled={!nuevoCatalogoNombre.trim() || loading}
                        >
                          {loading ? "Creando..." : "Crear Cargo"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
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
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(cargo.estado)}
                      
                      {/* Botón Editar Cargo */}
                      {cargo.catalogo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(cargo.catalogo!)}
                          title="Editar cargo"
                          aria-label={`Editar cargo ${cargo.catalogo?.nombre}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Botón Eliminar Cargo con Confirmación */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            title="Eliminar cargo"
                            aria-label={`Eliminar cargo ${cargo.catalogo?.nombre || 'sin nombre'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              Confirmar Eliminación
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas eliminar el cargo "{cargo.catalogo?.nombre || 'Cargo'}"?
                              <br />
                              <strong>Esta acción no se puede deshacer.</strong>
                              <br />
                              <br />
                              Si este cargo tiene candidatos registrados, también se eliminarán.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCargo(cargo.id_cargo, cargo.catalogo?.nombre || 'Cargo')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button
                        size="sm"
                        onClick={() => onContinue(cargo)}
                        disabled={loading}
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

        {/* Diálogo de Edición de Catálogo */}
        <Dialog open={isEditCatalogDialogOpen} onOpenChange={setIsEditCatalogDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cargo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre del Cargo</Label>
                <Input
                  id="edit-nombre"
                  value={editCatalogoNombre}
                  onChange={(e) => {
                    setEditCatalogoNombre(e.target.value);
                    if (editNombreError) setEditNombreError("");
                  }}
                  placeholder="Ej: Presidente, Secretario, etc."
                  className={editNombreError ? "border-destructive" : ""}
                />
                {editNombreError && (
                  <p className="text-sm text-destructive mt-1">{editNombreError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-descripcion">Descripción (opcional)</Label>
                <Input
                  id="edit-descripcion"
                  value={editCatalogoDescripcion}
                  onChange={(e) => setEditCatalogoDescripcion(e.target.value)}
                  placeholder="Descripción del cargo..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetEditCatalogForm}>
                  Cancelar
                </Button>
                <Button
                  onClick={editCatalog}
                  disabled={!editCatalogoNombre.trim() || loading}
                >
                  {loading ? "Actualizando..." : "Actualizar Cargo"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  );
}
