// src/services/rondaService.ts
import { API_URL } from "../api";

// Listar rondas (opcional por cargo)
export async function listarRondas(cargoId?: number) {
  const url = cargoId
    ? `${API_URL}/rondas/cargos/${cargoId}`
    : `${API_URL}/rondas`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al listar rondas");
  return res.json();
}

// Obtener una ronda por ID
export async function obtenerRonda(id_ronda: number) {
  const res = await fetch(`${API_URL}/rondas/${id_ronda}`);
  if (!res.ok) throw new Error("Error al obtener ronda");
  return res.json();
}

// Crear ronda
export async function crearRonda(id_cargo: number, numero_ronda: number, fecha: string) {
  const res = await fetch(`${API_URL}/rondas/cargos/${id_cargo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numero: numero_ronda, observaciones: `Ronda creada el ${fecha}` }),
  });
  if (!res.ok) throw new Error("Error al crear ronda");
  return res.json();
}

// Actualizar ronda
export async function actualizarRonda(
  id_ronda: number,
  id_cargo: number,
  numero_ronda: number,
  fecha: string
) {
  const res = await fetch(`${API_URL}/rondas/${id_ronda}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ finalizada: false, observaciones: `Ronda actualizada el ${fecha}` }),
  });
  if (!res.ok) throw new Error("Error al actualizar ronda");
  return res.json();
}

// Eliminar ronda
export async function eliminarRonda(id_ronda: number) {
  const res = await fetch(`${API_URL}/rondas/${id_ronda}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar ronda");
  return res.json();
}

// Detectar empate en una ronda
export async function detectarEmpate(id_ronda: number) {
  const res = await fetch(`${API_URL}/rondas/${id_ronda}/detectar-empate`);
  if (!res.ok) throw new Error("Error al detectar empate");
  return res.json();
}

// Crear segunda ronda en caso de empate
export async function crearSegundaRonda(id_ronda: number) {
  const res = await fetch(`${API_URL}/rondas/${id_ronda}/segunda-ronda`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al crear segunda ronda");
  return res.json();
}

// Declarar ganador de una ronda
export async function declararGanador(id_ronda: number) {
  const res = await fetch(`${API_URL}/rondas/${id_ronda}/ganador`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al declarar ganador");
  return res.json();
}
