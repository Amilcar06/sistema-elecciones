import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/cargos
 * Listar cargos con filtros opcionales
 */
router.get("/", async (req, res) => {
  try {
    const { id_eleccion, estado } = req.query;
    
    const where: any = {};
    if (id_eleccion) where.id_eleccion = Number(id_eleccion);
    if (estado) where.estado = String(estado);

    const cargos = await prisma.cargo.findMany({
      where,
      include: {
        catalogo: true,
        eleccion: {
          select: { id_eleccion: true, nombre: true, fecha: true }
        }
      },
      orderBy: { orden: "asc" }
    });
    
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar cargos", detalle: error });
  }
});

/**
 * GET /api/cargos/:id
 * Obtener un cargo específico
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const cargo = await prisma.cargo.findUnique({
      where: { id_cargo: Number(id) },
      include: {
        catalogo: true,
        eleccion: true,
        candidatos: true,
        rondas: true
      }
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
 * POST /api/cargos
 * Crear nuevo cargo en una elección
 */
router.post("/", async (req, res) => {
  try {
    const { id_eleccion, id_catalogo, orden, estado } = req.body;

    if (!id_eleccion || !id_catalogo) {
      return res.status(400).json({ 
        error: "id_eleccion e id_catalogo son obligatorios" 
      });
    }

    const nuevo = await prisma.cargo.create({
      data: {
        id_eleccion: Number(id_eleccion),
        id_catalogo: Number(id_catalogo),
        orden: orden || 1,
        estado: estado || "PENDIENTE",
      },
      include: {
        catalogo: true,
        eleccion: true
      }
    });

    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "El orden ya existe en esta elección" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Elección o cargo base no existe" });
    }
    res.status(400).json({ error: "Error creando cargo", detalle: error });
  }
});

/**
 * PUT /api/cargos/:id
 * Actualizar cargo
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { estado, orden } = req.body;

  try {
    const actualizado = await prisma.cargo.update({
      where: { id_cargo: Number(id) },
      data: {
        estado: estado || undefined,
        orden: orden || undefined,
      },
      include: {
        catalogo: true,
        eleccion: true
      }
    });

    res.json(actualizado);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cargo no encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ error: "El orden ya está en uso en esta elección" });
    }
    res.status(400).json({ error: "Error actualizando cargo", detalle: error });
  }
});

/**
 * DELETE /api/cargos/:id
 * Eliminar cargo
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cargo.delete({
      where: { id_cargo: Number(id) },
    });
    res.json({ message: "Cargo eliminado" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Cargo no encontrado" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "No se puede eliminar, el cargo tiene dependencias" });
    }
    res.status(400).json({ error: "Error eliminando cargo", detalle: error });
  }
});

export default router;
