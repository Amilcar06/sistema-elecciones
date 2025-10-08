import { apiClient } from "../api/client";

export interface Cargo {
  id_cargo: number;
  id_eleccion: number;
  id_catalogo: number;
  orden: number;
  estado: "PENDIENTE" | "EN_PROCESO" | "FINALIZADO";
  candidatos?: any[];
  rondas?: any[];
  eleccion?: any;
  catalogo?: {
    id_catalogo: number;
    nombre: string;
    descripcion?: string;
  };
}

// Listar todos (opcional filtrar por eleccionId)
export async function getCargos(eleccionId?: number): Promise<Cargo[]> {
  try {
    const endpoint = eleccionId ? `/cargos?id_eleccion=${eleccionId}` : '/cargos';
    return await apiClient.get(endpoint);
  } catch (error) {
    throw new Error("Error al obtener cargos");
  }
}

// Obtener un cargo
export async function getCargo(id_cargo: number): Promise<Cargo> {
  try {
    return await apiClient.get(`/cargos/${id_cargo}`);
  } catch (error) {
    throw new Error("Error al obtener cargo");
  }
}

// Crear un cargo
export async function crearCargo(data: {
  id_eleccion: number;
  id_catalogo: number;
  orden?: number;
  estado?: "PENDIENTE" | "EN_PROCESO" | "FINALIZADO";
}): Promise<Cargo> {
  try {
    return await apiClient.post('/cargos', data);
  } catch (error) {
    throw new Error("Error al crear cargo");
  }
}

// Actualizar un cargo
export async function actualizarCargo(
  id_cargo: number,
  data: {
    estado?: "PENDIENTE" | "EN_PROCESO" | "FINALIZADO";
    orden?: number;
  }
): Promise<Cargo> {
  try {
    return await apiClient.put(`/cargos/${id_cargo}`, data);
  } catch (error) {
    throw new Error("Error al actualizar cargo");
  }
}

// Eliminar un cargo
export async function eliminarCargo(id_cargo: number): Promise<void> {
  try {
    await apiClient.delete(`/cargos/${id_cargo}`);
  } catch (error) {
    throw new Error("Error al eliminar cargo");
  }
}

// Listar cargos de una elección (ordenados)
export async function getCargosPorEleccion(id_eleccion: number): Promise<Cargo[]> {
  try {
    return await apiClient.get(`/cargos?id_eleccion=${id_eleccion}`);
  } catch (error) {
    throw new Error("Error al obtener cargos de la elección");
  }
}