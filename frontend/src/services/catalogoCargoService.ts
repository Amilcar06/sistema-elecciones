// src/services/catalogoCargoService.ts
import { apiClient } from "../api/client";

// Listar todos los catálogos de cargo
export async function listarCatalogos() {
  try {
    return await apiClient.get('/catalogo-cargos');
  } catch (error) {
    throw new Error("Error al listar los catálogos");
  }
}

// Obtener un catálogo por ID
export async function obtenerCatalogo(id_catalogo: number) {
  try {
    return await apiClient.get(`/catalogo-cargos/${id_catalogo}`);
  } catch (error) {
    throw new Error("Error al obtener el catálogo");
  }
}

// Crear un catálogo de cargo
export async function crearCatalogo(nombre: string, descripcion?: string) {
  try {
    const data = { nombre, descripcion };
    return await apiClient.post('/catalogo-cargos', data);
  } catch (error) {
    throw new Error("Error al crear el catálogo");
  }
}

// Actualizar un catálogo de cargo
export async function actualizarCatalogo(
  id_catalogo: number,
  nombre: string,
  descripcion?: string
) {
  try {
    const data = { nombre, descripcion };
    return await apiClient.put(`/catalogo-cargos/${id_catalogo}`, data);
  } catch (error) {
    throw new Error("Error al actualizar el catálogo");
  }
}

// Eliminar un catálogo de cargo
export async function eliminarCatalogo(id_catalogo: number) {
  try {
    return await apiClient.delete(`/catalogo-cargos/${id_catalogo}`);
  } catch (error) {
    throw new Error("Error al eliminar el catálogo");
  }
}
