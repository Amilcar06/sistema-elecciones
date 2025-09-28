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
 * Obtener ganador de la ronda
 */
router.get("/rondas/:id/ganador", async (req, res) => {
  try {
    const { id } = req.params;
    const ganador = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        c.id_candidato,
        c.nombre_completo,
        r.votos,
        r.id_ronda
      FROM "Resultado" r
      JOIN "Candidato" c ON r.id_candidato = c.id_candidato
      WHERE r.id_ronda = ${Number(id)}
        AND r.votos = (
          SELECT MAX(votos) 
          FROM "Resultado" 
          WHERE id_ronda = ${Number(id)}
        )
      LIMIT 1
    `);
    res.json(ganador[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ganador", details: err });
  }
});

/**
 * GET /api/rondas/:id/empate
 * Verificar si hubo empate
 */
router.get("/rondas/:id/empate", async (req, res) => {
  try {
    const { id } = req.params;
    const empate = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        COUNT(*) > 1 AS empate
      FROM "Resultado" r
      WHERE r.id_ronda = ${Number(id)}
        AND r.votos = (
          SELECT MAX(votos) 
          FROM "Resultado" 
          WHERE id_ronda = ${Number(id)}
        )
    `);
    res.json({ empate: empate[0]?.empate || false });
  } catch (err) {
    res.status(500).json({ error: "Error al verificar empate", details: err });
  }
});

/**
 * GET /api/rondas/:id/detallado
 * Resultados detallados con posición
 */
router.get("/rondas/:id/detallado", async (req, res) => {
  try {
    const { id } = req.params;
    const detallados = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        r.id_resultado,
        r.id_ronda,
        r.id_candidato,
        c.nombre_completo,
        r.votos,
        ROW_NUMBER() OVER (ORDER BY r.votos DESC) as posicion,
        ROUND((r.votos * 100.0 / SUM(r.votos) OVER ()), 2) as porcentaje
      FROM "Resultado" r
      JOIN "Candidato" c ON r.id_candidato = c.id_candidato
      WHERE r.id_ronda = ${Number(id)}
      ORDER BY r.votos DESC
    `);
    res.json(detallados);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener resultados detallados", details: err });
  }
});

export default router;
