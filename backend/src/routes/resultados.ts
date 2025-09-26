import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/resultados/rondas/:idRonda
 * Listar resultados de una ronda
 */
router.get("/rondas/:idRonda", async (req, res) => {
  try {
    const { idRonda } = req.params;
    const resultados = await prisma.resultado.findMany({
      where: { id_ronda: Number(idRonda) },
      include: { candidato: true },
      orderBy: { votos: "desc" },
    });
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: "Error al listar resultados", details: err });
  }
});

/**
 * POST /api/resultados/rondas/:idRonda
 * Registrar votos de varios candidatos en la ronda
 * body: [ { id_candidato, votos } ]
 */
router.post("/rondas/:idRonda", async (req, res) => {
  try {
    const { idRonda } = req.params;
    const resultados: { id_candidato: number; votos: number }[] = req.body;

    const insertados = await prisma.$transaction(
      resultados.map(r =>
        prisma.resultado.create({
          data: {
            id_ronda: Number(idRonda),
            id_candidato: r.id_candidato,
            votos: r.votos,
          },
        })
      )
    );

    res.status(201).json(insertados);
  } catch (err) {
    res.status(500).json({ error: "Error al registrar resultados", details: err });
  }
});

/**
 * PUT /api/resultados/:id
 * Actualizar votos de un resultado
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { votos } = req.body;

    const actualizado = await prisma.resultado.update({
      where: { id_resultado: Number(id) },
      data: { votos },
    });

    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar resultado", details: err });
  }
});

/**
 * DELETE /api/resultados/:id
 * Eliminar resultado
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.resultado.delete({
      where: { id_resultado: Number(id) },
    });

    res.json({ message: "Resultado eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar resultado", details: err });
  }
});

/**
 * GET /api/rondas/:id/ganador
 * Obtener ganador de la ronda (función SQL)
 */
router.get("/rondas/:id/ganador", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT obtener_ganador_ronda(${Number(id)}) AS ganador`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ganador", details: err });
  }
});

/**
 * GET /api/rondas/:id/empate
 * Verificar si hubo empate (función SQL)
 */
router.get("/rondas/:id/empate", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await prisma.$queryRawUnsafe<any[]>(
      `SELECT hay_empate_primer_lugar(${Number(id)}) AS empate`
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Error al verificar empate", details: err });
  }
});

/**
 * GET /api/rondas/:id/detallado
 * Resultados detallados (vista v_resultados_detallados)
 */
router.get("/rondas/:id/detallado", async (req, res) => {
  try {
    const { id } = req.params;
    const detallados = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM v_resultados_detallados WHERE id_ronda = ${Number(id)} ORDER BY posicion`
    );
    res.json(detallados);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener resultados detallados", details: err });
  }
});

export default router;
