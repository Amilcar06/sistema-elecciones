// src/services/candidatoService.ts
import { apiClient } from "../api/client";

export interface Candidato {
  id_candidato: number;
  id_cargo: number;
  nombre_completo: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Listar candidatos (opcional por cargo)
export async function listarCandidatos(cargoId?: number): Promise<Candidato[]> {
  try {
    const endpoint = cargoId ? `/candidatos?id_cargo=${cargoId}` : '/candidatos';
    return await apiClient.get<Candidato[]>(endpoint);
  } catch (error) {
    throw new Error("Error al listar candidatos");
  }
}

// Obtener un candidato por ID
export async function obtenerCandidato(id_candidato: number): Promise<Candidato> {
  try {
    return await apiClient.get<Candidato>(`/candidatos/${id_candidato}`);
  } catch (error) {
    throw new Error("Error al obtener candidato");
  }
}

// Registrar candidato
export async function crearCandidato(
  id_cargo: number,
  nombre_completo: string,
  activo = true
): Promise<Candidato> {
  try {
    const data = { id_cargo, nombre_completo, activo };
    return await apiClient.post<Candidato>('/candidatos', data);
  } catch (error) {
    console.error('Error en crearCandidato:', error);
    throw new Error("Error al registrar candidato");
  }
}

// Actualizar candidato
export async function actualizarCandidato(
  id_candidato: number,
  id_cargo: number,
  nombre_completo: string,
  activo = true
): Promise<Candidato> {
  try {
    const data = { nombre_completo, activo };
    return await apiClient.put<Candidato>(`/candidatos/${id_candidato}`, data);
  } catch (error) {
    console.error('Error en actualizarCandidato:', error);
    throw new Error("Error al actualizar candidato");
  }
}

// Eliminar candidato
export async function eliminarCandidato(id_candidato: number): Promise<{ message: string }> {
  try {
    return await apiClient.delete<{ message: string }>(`/candidatos/${id_candidato}`);
  } catch (error) {
    throw new Error("Error al eliminar candidato");
  }
}
