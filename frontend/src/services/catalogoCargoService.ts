// src/services/catalogoCargoService.ts
import { API_URL } from "../api";

// Listar todos los catálogos de cargo
export async function listarCatalogos() {
  const res = await fetch(`${API_URL}/catalogo-cargos`);
  if (!res.ok) throw new Error("Error al listar los catálogos");
  return res.json();
}

// Obtener un catálogo por ID
export async function obtenerCatalogo(id_catalogo: number) {
  const res = await fetch(`${API_URL}/catalogo-cargos/${id_catalogo}`);
  if (!res.ok) throw new Error("Error al obtener el catálogo");
  return res.json();
}

// Crear un catálogo de cargo
export async function crearCatalogo(nombre: string, descripcion?: string) {
  const res = await fetch(`${API_URL}/catalogo-cargos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, descripcion }),
  });
  if (!res.ok) throw new Error("Error al crear el catálogo");
  return res.json();
}

// Actualizar un catálogo de cargo
export async function actualizarCatalogo(
  id_catalogo: number,
  nombre: string,
  descripcion?: string
) {
  const res = await fetch(`${API_URL}/catalogo-cargos/${id_catalogo}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, descripcion }),
  });
  if (!res.ok) throw new Error("Error al actualizar el catálogo");
  return res.json();
}

// Eliminar un catálogo de cargo
export async function eliminarCatalogo(id_catalogo: number) {
  const res = await fetch(`${API_URL}/catalogo-cargos/${id_catalogo}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el catálogo");
  return res.json();
}
