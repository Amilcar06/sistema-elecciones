import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/catalogo-cargos
 * Listar todos los cargos disponibles
 */
router.get("/", async (_, res) => {
  try {
    const cargos = await prisma.catalogoCargo.findMany({
      orderBy: { nombre: "asc" },
    });
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar cargos", detalle: error });
  }
});

/**
 * GET /api/catalogo-cargos/:id
 * Obtener un cargo específico por ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const cargo = await prisma.catalogoCargo.findUnique({
      where: { id_catalogo: Number(id) }
    });

    if (!cargo) {
      return res.status(404).json({ error: "Cargo no encontrado" });
    }

    res.json(cargo);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cargo", detalle: error });
  }
});

/**
 * POST /api/catalogo-cargos
 * Crear nuevo cargo base
 */
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const nuevo = await prisma.catalogoCargo.create({
      data: { nombre, descripcion },
    });

    res.json(nuevo);
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint en nombre
      return res.status(400).json({ error: "El cargo ya existe" });
    }
    res.status(400).json({ error: "Error creando cargo", detalle: error });
  }
});

/**
 * PUT /api/catalogo-cargos/:id
 * Actualizar nombre o descripción
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const actualizado = await prisma.catalogoCargo.update({
      where: { id_catalogo: Number(id) },
      data: {
        nombre: nombre || undefined,
        descripcion: descripcion || undefined,
      },
    });

    res.json(actualizado);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cargo no encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Ya existe un cargo con ese nombre" });
    }
    res.status(400).json({ error: "Error actualizando cargo", detalle: error });
  }
});

/**
 * DELETE /api/catalogo-cargos/:id
 * Eliminar cargo base (si no está en uso)
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.catalogoCargo.delete({
      where: { id_catalogo: Number(id) },
    });
    res.json({ message: "Cargo eliminado" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cargo no encontrado" });
    }
    // Si está en uso (FK constraint), no permite borrar
    if (error.code === "P2003") {
      return res.status(400).json({ error: "No se puede eliminar, cargo en uso" });
    }
    res.status(400).json({ error: "Error eliminando cargo", detalle: error });
  }
});

export default router;
