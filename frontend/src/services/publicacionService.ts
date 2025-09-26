import { API_URL } from "../api";

export interface Publicacion {
  id_publicacion: number;
  id_eleccion: number;
  publicado_por?: string;
  fecha_publicacion: string;
  modo: "PROYECTOR" | "PDF" | "EXCEL";
  nota?: string;
  eleccion?: any;
}

// Listar todas las publicaciones
export async function getPublicaciones(): Promise<Publicacion[]> {
  const res = await fetch(`${API_URL}/publicaciones`);
  if (!res.ok) throw new Error("Error al obtener publicaciones");
  return res.json();
}

// Obtener publicación por ID
export async function getPublicacion(id: number): Promise<Publicacion> {
  const res = await fetch(`${API_URL}/publicaciones/${id}`);
  if (!res.ok) throw new Error("Error al obtener publicación");
  return res.json();
}

// Crear nueva publicación
export async function crearPublicacion(data: {
  id_eleccion: number;
  nota?: string;
  publicado_por?: string;
  modo?: "PROYECTOR" | "PDF" | "EXCEL";
}): Promise<Publicacion> {
  const res = await fetch(`${API_URL}/publicaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear publicación");
  return res.json();
}

// Actualizar publicación
export async function actualizarPublicacion(
  id: number,
  data: {
    nota?: string;
    publicado_por?: string;
    modo?: "PROYECTOR" | "PDF" | "EXCEL";
  }
): Promise<Publicacion> {
  const res = await fetch(`${API_URL}/publicaciones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar publicación");
  return res.json();
}

// Eliminar publicación
export async function eliminarPublicacion(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/publicaciones/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar publicación");
}

// Obtener publicaciones por elección
export async function getPublicacionesPorEleccion(id_eleccion: number): Promise<Publicacion[]> {
  const res = await fetch(`${API_URL}/elecciones/${id_eleccion}/publicaciones`);
  if (!res.ok) throw new Error("Error al obtener publicaciones de la elección");
  return res.json();
}
