// src/services/resultadoService.ts
import { apiClient } from "../api/client";

// Listar resultados de una ronda específica
export async function listarResultados(rondaId: number) {
  try {
    return await apiClient.get(`/resultados/rondas/${rondaId}`);
  } catch (error) {
    throw new Error("Error al listar resultados");
  }
}

// Obtener un resultado por ID
export async function obtenerResultado(id_resultado: number) {
  try {
    return await apiClient.get(`/resultados/${id_resultado}`);
  } catch (error) {
    throw new Error("Error al obtener resultado");
  }
}

// Registrar resultados de una ronda (múltiples candidatos)
export async function crearResultado(
  id_ronda: number,
  resultados: { id_candidato: number; votos: number }[]
) {
  try {
    return await apiClient.post(`/resultados/rondas/${id_ronda}`, resultados);
  } catch (error) {
    throw new Error("Error al registrar resultados");
  }
}

// Actualizar resultado individual
export async function actualizarResultado(
  id_resultado: number,
  votos: number
) {
  try {
    return await apiClient.put(`/resultados/${id_resultado}`, { votos });
  } catch (error) {
    throw new Error("Error al actualizar resultado");
  }
}

// Eliminar resultado
export async function eliminarResultado(id_resultado: number) {
  try {
    return await apiClient.delete(`/resultados/${id_resultado}`);
  } catch (error) {
    throw new Error("Error al eliminar resultado");
  }
}
