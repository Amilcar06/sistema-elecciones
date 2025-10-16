import { apiClient } from "../api/client";
import { EstadoEleccion } from "../api/types";

export interface Eleccion {
  id_eleccion: number;
  nombre: string;
  fecha: string; 
  estado: EstadoEleccion; 
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  cargos?: any[];  
  id_usuario_creador?: any; 
  usuario_creador?: any; 
  publicaciones?: any[];
}

// Obtener todas las elecciones
export async function getElecciones(): Promise<Eleccion[]> {
  try {
    return await apiClient.get<Eleccion[]>('/elecciones');
  } catch (error) {
    throw new Error("Error al obtener elecciones");
  }
}

// Obtener resumen de elecciones
export async function getResumenElecciones(): Promise<any[]> {
  try {
    return await apiClient.get<any[]>('/elecciones/resumen/lista');
  } catch (error) {
    throw new Error("Error al obtener resumen de elecciones");
  }
}

// Obtener resultados públicos para proyector
export async function getResultadosPublicos(id: number): Promise<any> {
  try {
    return await apiClient.get<any>(`/elecciones/${id}/resultados-publicos`);
  } catch (error) {
    throw new Error("Error al obtener resultados públicos");
  }
}

// Obtener resumen final con ganadores
export async function getResumenFinal(id: number): Promise<any[]> {
  try {
    return await apiClient.get<any[]>(`/elecciones/${id}/resumen-final`);
  } catch (error) {
    throw new Error("Error al obtener resumen final");
  }
}

// Generar reporte
export async function generarReporte(id: number, formato: string = 'pdf'): Promise<any> {
  try {
    const data = { formato, incluir_detalles: true };
    return await apiClient.post<any>(`/elecciones/${id}/generar-reporte`, data);
  } catch (error) {
    throw new Error("Error al generar reporte");
  }
}

// Obtener una por ID
export async function getEleccion(id: number): Promise<Eleccion> {
  try {
    return await apiClient.get<Eleccion>(`/elecciones/${id}`);
  } catch (error) {
    throw new Error("Error al obtener elección");
  }
}

// Crear nueva elección
export async function crearEleccion(data: {
  nombre: string;
  fecha: string;
  anio: number;
  descripcion?: string;
}): Promise<Eleccion> {
  try {
    return await apiClient.post<Eleccion>('/elecciones', data);
  } catch (error) {
    throw new Error("Error al crear elección");
  }
}

// Actualizar elección
export async function actualizarEleccion(
  id: number,
  data: {
    nombre?: string;
    descripcion?: string;
    fecha?: string;
    anio?: number;
    estado?: EstadoEleccion;
  }
): Promise<Eleccion> {
  try {
    return await apiClient.put<Eleccion>(`/elecciones/${id}`, data);
  } catch (error) {
    throw new Error("Error al actualizar elección");
  }
}

// Eliminar elección
export async function eliminarEleccion(id: number): Promise<void> {
  try {
    await apiClient.delete<void>(`/elecciones/${id}`);
  } catch (error) {
    throw new Error("Error al eliminar elección");
  }
}

// Cambiar estado de elección
export async function cambiarEstadoEleccion(
  id: number,
  estado: EstadoEleccion
): Promise<Eleccion> {
  try {
    return await apiClient.patch<Eleccion>(`/elecciones/${id}/estado`, { estado });
  } catch (error) {
    throw new Error("Error al cambiar estado de elección");
  }
}
