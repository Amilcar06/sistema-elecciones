// src/services/rondaService.ts
import { apiClient } from "../api/client";

// Listar rondas (opcional por cargo)
export async function listarRondas(cargoId?: number) {
  try {
    if (cargoId) {
      return await apiClient.get(`/rondas/cargos/${cargoId}`);
    } else {
      return await apiClient.get('/rondas');
    }
  } catch (error) {
    throw new Error("Error al listar rondas");
  }
}

// Obtener una ronda por ID
export async function obtenerRonda(id_ronda: number) {
  try {
    return await apiClient.get(`/rondas/${id_ronda}`);
  } catch (error) {
    throw new Error("Error al obtener ronda");
  }
}

// Crear ronda
export async function crearRonda(id_cargo: number, numero_ronda: number, fecha: string) {
  try {
    return await apiClient.post(`/rondas/cargos/${id_cargo}`, {
      numero: numero_ronda,
      observaciones: `Ronda creada el ${fecha}`
    });
  } catch (error) {
    throw new Error("Error al crear ronda");
  }
}

// Actualizar ronda
export async function actualizarRonda(
  id_ronda: number,
  id_cargo: number,
  numero_ronda: number,
  fecha: string
) {
  try {
    return await apiClient.put(`/rondas/${id_ronda}`, {
      finalizada: false,
      observaciones: `Ronda actualizada el ${fecha}`
    });
  } catch (error) {
    throw new Error("Error al actualizar ronda");
  }
}

// Eliminar ronda
export async function eliminarRonda(id_ronda: number) {
  try {
    return await apiClient.delete(`/rondas/${id_ronda}`);
  } catch (error) {
    throw new Error("Error al eliminar ronda");
  }
}

// Detectar empate en una ronda
export async function detectarEmpate(id_ronda: number) {
  try {
    return await apiClient.get(`/rondas/${id_ronda}/detectar-empate`);
  } catch (error) {
    throw new Error("Error al detectar empate");
  }
}

// Crear segunda ronda en caso de empate
export async function crearSegundaRonda(id_ronda: number) {
  try {
    return await apiClient.post(`/rondas/${id_ronda}/segunda-ronda`);
  } catch (error) {
    throw new Error("Error al crear segunda ronda");
  }
}

// Declarar ganador de una ronda
export async function declararGanador(id_ronda: number) {
  try {
    return await apiClient.post(`/rondas/${id_ronda}/ganador`);
  } catch (error) {
    throw new Error("Error al declarar ganador");
  }
}
