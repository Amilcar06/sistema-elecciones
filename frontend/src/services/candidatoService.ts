// src/services/candidatoService.ts
import { API_URL } from "../api";

export interface Candidato {
  id_candidato: number;
  id_cargo: number;
  nombre_completo: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Listar candidatos (opcional por cargo)
export async function listarCandidatos(cargoId?: number) {
  const url = cargoId
    ? `${API_URL}/candidatos?id_cargo=${cargoId}`
    : `${API_URL}/candidatos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al listar candidatos");
  return res.json();
}

// Obtener un candidato por ID
export async function obtenerCandidato(id_candidato: number) {
  const res = await fetch(`${API_URL}/candidatos/${id_candidato}`);
  if (!res.ok) throw new Error("Error al obtener candidato");
  return res.json();
}

// Registrar candidato
export async function crearCandidato(
  id_cargo: number,
  nombre_completo: string,
  activo = true
) {
  const res = await fetch(`${API_URL}/candidatos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_cargo, nombre: nombre_completo, activo }),
  });
  if (!res.ok) throw new Error("Error al registrar candidato");
  return res.json();
}

// Actualizar candidato
export async function actualizarCandidato(
  id_candidato: number,
  id_cargo: number,
  nombre_completo: string,
  activo = true
) {
  const res = await fetch(`${API_URL}/candidatos/${id_candidato}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: nombre_completo, activo }),
  });
  if (!res.ok) throw new Error("Error al actualizar candidato");
  return res.json();
}

// Eliminar candidato
export async function eliminarCandidato(id_candidato: number) {
  const res = await fetch(`${API_URL}/candidatos/${id_candidato}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar candidato");
  return res.json();
}
