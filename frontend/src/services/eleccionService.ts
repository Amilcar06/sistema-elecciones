import { API_URL } from "../api";

export interface Eleccion {
  id_eleccion: number;
  nombre: string;
  fecha: string;        // en formato ISO
  anio?: number;
  descripcion?: string;
  estado: "DRAFT" | "EN_CURSO" | "FINALIZADA";
  created_at?: string;
  updated_at?: string;
  cargos?: any[];       // puedes tipar mejor según tu modelo
}

// Obtener todas las elecciones
export async function getElecciones(): Promise<Eleccion[]> {
  const res = await fetch(`${API_URL}/elecciones`);
  if (!res.ok) throw new Error("Error al obtener elecciones");
  return res.json();
}

// Obtener resumen de elecciones
export async function getResumenElecciones(): Promise<any[]> {
  const res = await fetch(`${API_URL}/elecciones/resumen/lista`);
  if (!res.ok) throw new Error("Error al obtener resumen de elecciones");
  return res.json();
}

// Obtener resultados públicos para proyector
export async function getResultadosPublicos(id: number): Promise<any> {
  const res = await fetch(`${API_URL}/elecciones/${id}/resultados-publicos`);
  if (!res.ok) throw new Error("Error al obtener resultados públicos");
  return res.json();
}

// Obtener resumen final con ganadores
export async function getResumenFinal(id: number): Promise<any[]> {
  const res = await fetch(`${API_URL}/elecciones/${id}/resumen-final`);
  if (!res.ok) throw new Error("Error al obtener resumen final");
  return res.json();
}

// Generar reporte
export async function generarReporte(id: number, formato: string = 'pdf'): Promise<any> {
  const res = await fetch(`${API_URL}/elecciones/${id}/generar-reporte`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formato, incluir_detalles: true }),
  });
  if (!res.ok) throw new Error("Error al generar reporte");
  return res.json();
}

// Obtener una por ID
export async function getEleccion(id: number): Promise<Eleccion> {
  const res = await fetch(`${API_URL}/elecciones/${id}`);
  if (!res.ok) throw new Error("Error al obtener elección");
  return res.json();
}

// Crear nueva elección
export async function crearEleccion(data: {
  nombre: string;
  fecha: string;
  anio: number;
  descripcion?: string;
}): Promise<Eleccion> {
  const res = await fetch(`${API_URL}/elecciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear elección");
  return res.json();
}

// Actualizar elección
export async function actualizarEleccion(
  id: number,
  data: {
    nombre?: string;
    descripcion?: string;
    fecha?: string;
    anio?: number;
    estado?: "DRAFT" | "EN_CURSO" | "FINALIZADA";
  }
): Promise<Eleccion> {
  const res = await fetch(`${API_URL}/elecciones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar elección");
  return res.json();
}

// Eliminar elección
export async function eliminarEleccion(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/elecciones/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar elección");
}

// Cambiar estado de elección
export async function cambiarEstadoEleccion(
  id: number,
  estado: "DRAFT" | "EN_CURSO" | "FINALIZADA"
): Promise<Eleccion> {
  const res = await fetch(`${API_URL}/elecciones/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al cambiar estado de elección");
  return res.json();
}
