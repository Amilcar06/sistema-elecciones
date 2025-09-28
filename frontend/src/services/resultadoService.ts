// src/services/resultadoService.ts
import { API_URL } from "../api";

// Listar resultados de una ronda específica
export async function listarResultados(rondaId: number) {
  const res = await fetch(`${API_URL}/resultados/rondas/${rondaId}`);
  if (!res.ok) throw new Error("Error al listar resultados");
  return res.json();
}

// Obtener un resultado por ID
export async function obtenerResultado(id_resultado: number) {
  const res = await fetch(`${API_URL}/resultados/${id_resultado}`);
  if (!res.ok) throw new Error("Error al obtener resultado");
  return res.json();
}

// Registrar resultados de una ronda (múltiples candidatos)
export async function crearResultado(
  id_ronda: number,
  resultados: { id_candidato: number; votos: number }[]
) {
  const res = await fetch(`${API_URL}/resultados/rondas/${id_ronda}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resultados),
  });
  if (!res.ok) throw new Error("Error al registrar resultados");
  return res.json();
}

// Actualizar resultado individual
export async function actualizarResultado(
  id_resultado: number,
  votos: number
) {
  const res = await fetch(`${API_URL}/resultados/${id_resultado}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ votos }),
  });
  if (!res.ok) throw new Error("Error al actualizar resultado");
  return res.json();
}

// Eliminar resultado
export async function eliminarResultado(id_resultado: number) {
  const res = await fetch(`${API_URL}/resultados/${id_resultado}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar resultado");
  return res.json();
}
