import { API_URL } from "../api";

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
  const url = eleccionId
    ? `${API_URL}/cargos?id_eleccion=${eleccionId}`
    : `${API_URL}/cargos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener cargos");
  return res.json();
}

// Obtener un cargo
export async function getCargo(id_cargo: number): Promise<Cargo> {
  const res = await fetch(`${API_URL}/cargos/${id_cargo}`);
  if (!res.ok) throw new Error("Error al obtener cargo");
  return res.json();
}

// Crear un cargo
export async function crearCargo(data: {
  id_eleccion: number;
  id_catalogo: number;
  orden?: number;
  estado?: "PENDIENTE" | "EN_PROCESO" | "FINALIZADO";
}): Promise<Cargo> {
  const res = await fetch(`${API_URL}/cargos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear cargo");
  return res.json();
}

// Actualizar un cargo
export async function actualizarCargo(
  id_cargo: number,
  data: {
    estado?: "PENDIENTE" | "EN_PROCESO" | "FINALIZADO";
    orden?: number;
  }
): Promise<Cargo> {
  const res = await fetch(`${API_URL}/cargos/${id_cargo}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar cargo");
  return res.json();
}

// Eliminar un cargo
export async function eliminarCargo(id_cargo: number): Promise<void> {
  const res = await fetch(`${API_URL}/cargos/${id_cargo}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar cargo");
}

// Listar cargos de una elección (ordenados)
export async function getCargosPorEleccion(id_eleccion: number): Promise<Cargo[]> {
  const res = await fetch(`${API_URL}/cargos?id_eleccion=${id_eleccion}`);
  if (!res.ok) throw new Error("Error al obtener cargos de la elección");
  return res.json();
}
