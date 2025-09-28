import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/rondas/cargos/:idCargo
 * Listar rondas de un cargo
 */
router.get("/cargos/:idCargo", async (req, res) => {
  try {
    const { idCargo } = req.params;
    const rondas = await prisma.ronda.findMany({
      where: { id_cargo: Number(idCargo) },
      orderBy: { numero_ronda: "asc" },
    });
    res.json(rondas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener rondas", details: err });
  }
});

/**
 * POST /api/rondas/cargos/:idCargo
 * Crear nueva ronda
 */
router.post("/cargos/:idCargo", async (req, res) => {
  try {
    const { idCargo } = req.params;
    const { numero, observaciones } = req.body;

    // obtener último número de ronda para ese cargo
    const ultima = await prisma.ronda.findFirst({
      where: { id_cargo: Number(idCargo) },
      orderBy: { numero_ronda: "desc" },
    });

    const numero_ronda = numero ?? (ultima ? ultima.numero_ronda + 1 : 1);

    const nueva = await prisma.ronda.create({
      data: {
        id_cargo: Number(idCargo),
        numero_ronda,
        observaciones: observaciones ?? null,
      },
    });

    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: "Error al crear ronda", details: err });
  }
});

/**
 * PUT /api/rondas/:id
 * Actualizar ronda (ej. marcar finalizada, editar observaciones)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { finalizada, observaciones } = req.body;

    const ronda = await prisma.ronda.update({
      where: { id_ronda: Number(id) },
      data: {
        finalizada: finalizada !== undefined ? finalizada : undefined,
        observaciones: observaciones ?? undefined,
      },
    });

    res.json(ronda);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar ronda", details: err });
  }
});

/**
 * DELETE /api/rondas/:id
 * Eliminar ronda (si no hay resultados asociados)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 🔒 aquí deberías validar si existen resultados antes de borrar
    // ej: const existeResultado = await prisma.resultado.findFirst({ where: { id_ronda: Number(id) } });
    // if (existeResultado) return res.status(400).json({ error: "No se puede eliminar una ronda con resultados" });

    await prisma.ronda.delete({
      where: { id_ronda: Number(id) },
    });

    res.json({ message: "Ronda eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar ronda", details: err });
  }
});

export default router;
