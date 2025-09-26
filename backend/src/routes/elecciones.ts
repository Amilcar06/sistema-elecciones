import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/elecciones/resumen
 * Resumen desde vista v_elecciones_resumen
 * REVISAR PORQUE NO SIRVE
 */
router.get("/resumen/lista", async (_, res) => {
  try {
    const resumen = await prisma.$queryRawUnsafe(
      `SELECT 
          e.id_eleccion,
          e.nombre,
          e.fecha,
          e.estado,
          e.descripcion,
          /*COUNT(c.id_cargo) AS total_cargos,*/
          e.created_at,
          e.updated_at
      FROM Eleccion e
      LEFT JOIN Cargo c ON e.id_eleccion = c.id_eleccion
      GROUP BY e.id_eleccion, e.nombre, e.fecha, e.estado, e.descripcion, e.created_at, e.updated_at
      ORDER BY e.fecha DESC`
    );
    res.json(resumen);
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({ error: "Error al obtener resumen", detalle: error });
  }
});

/**
 * GET /api/elecciones
 * Listar elecciones (con filtros opcionales: estado, anio)
 */
router.get("/", async (req, res) => {
  try {
    const { estado, anio } = req.query;

    const where: any = {};
    if (estado) where.estado = String(estado);
    if (anio) {
      const anioNum = Number(anio);
      where.fecha = {
        gte: new Date(`${anioNum}-01-01`),
        lte: new Date(`${anioNum}-12-31`),
      };
    }

    const elecciones = await prisma.eleccion.findMany({
      where,
      include: { 
        cargos: {
          include: {
            catalogo: true,
            candidatos: {
              where: { activo: true },
              include: {
                resultados: {
                  include: {
                    ronda: true
                  }
                }
              }
            }
          },
          orderBy: { orden: "asc" }
        }
      },
      orderBy: { fecha: "desc" },
    });

    res.json(elecciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener elecciones", detalle: error });
  }
});

/**
 * GET /api/elecciones/:id
 * Obtener detalle de una elección
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const eleccion = await prisma.eleccion.findUnique({
      where: { id_eleccion: Number(id) },
      include: { cargos: true },
    });

    if (!eleccion) return res.status(404).json({ error: "Elección no encontrada" });

    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener elección", detalle: error });
  }
});

/**
 * POST /api/elecciones
 * Crear nueva elección
 */
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, fecha, anio } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    // Usar la fecha enviada por el frontend, o la fecha actual si no se proporciona
    const fechaEleccion = fecha ? new Date(fecha) : new Date();

    const eleccion = await prisma.eleccion.create({
      data: {
        nombre,
        descripcion,
        fecha: fechaEleccion,
        estado: "DRAFT", 
      },
    });

    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: "Error al crear elección", detalle: error });
  }
});

/**
 * PUT /api/elecciones/:id
 * Actualizar elección
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const eleccion = await prisma.eleccion.update({
      where: { id_eleccion: Number(id) },
      data: {
        nombre,
        descripcion,
      },
    });

    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar elección", detalle: error });
  }
});


/**
 * DELETE /api/elecciones/:id
 * Eliminar elección
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.eleccion.delete({
      where: { id_eleccion: Number(id) },
    });
    res.json({ message: "Elección eliminada" });
  } catch (error) {
    res.status(404).json({ error: "Elección no encontrada", detalle: error });
  }
});

/**
 * PATCH /api/elecciones/:id/estado
 * Cambiar estado de elección
 */
router.patch("/:id/estado", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["DRAFT", "EN_CURSO", "FINALIZADA"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  try {
    const actualizada = await prisma.eleccion.update({
      where: { id_eleccion: Number(id) },
      data: { estado },
    });

    res.json(actualizada);
  } catch (error) {
    res.status(404).json({ error: "Elección no encontrada", detalle: error });
  }
});

/**
 * GET /api/elecciones/:id/resultados-publicos
 * Obtener resultados para pantalla pública/proyector
 */
router.get("/:id/resultados-publicos", async (req, res) => {
  const { id } = req.params;
  try {
    const eleccion = await prisma.eleccion.findUnique({
      where: { id_eleccion: Number(id) },
      include: {
        cargos: {
          include: {
            catalogo: true,
            candidatos: {
              where: { activo: true }
            },
            rondas: {
              include: {
                resultados: {
                  include: {
                    candidato: true
                  }
                }
              },
              orderBy: { numero_ronda: "desc" }
            }
          },
          orderBy: { orden: "asc" }
        }
      }
    });

    if (!eleccion) {
      return res.status(404).json({ error: "Elección no encontrada" });
    }

    res.json(eleccion);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener resultados públicos", detalle: error });
  }
});

/**
 * GET /api/elecciones/:id/resumen-final
 * Obtener resumen final con todos los ganadores
 */
router.get("/:id/resumen-final", async (req, res) => {
  const { id } = req.params;
  try {
    const resumen = await prisma.$queryRawUnsafe(`
      SELECT 
        c.id_cargo,
        cat.nombre as nombre_cargo,
        c.orden,
        cand.id_candidato,
        cand.nombre_completo as nombre_candidato,
        res.votos,
        ROUND((res.votos * 100.0 / (
          SELECT SUM(res2.votos) 
          FROM Resultado res2 
          WHERE res2.id_ronda = r.id_ronda
        )), 2) as porcentaje,
        r.numero_ronda,
        e.nombre as eleccion_nombre,
        e.fecha
      FROM Eleccion e
      JOIN Cargo c ON e.id_eleccion = c.id_eleccion
      JOIN CatalogoCargo cat ON c.id_catalogo = cat.id_catalogo
      JOIN Ronda r ON c.id_cargo = r.id_cargo
      JOIN Resultado res ON r.id_ronda = res.id_ronda
      JOIN Candidato cand ON res.id_candidato = cand.id_candidato
      WHERE e.id_eleccion = ${Number(id)}
        AND res.votos = (
          SELECT MAX(res2.votos) 
          FROM Resultado res2 
          WHERE res2.id_ronda = r.id_ronda
        )
        AND EXISTS (
          SELECT 1 FROM Resultado res3 
          WHERE res3.id_ronda = r.id_ronda
        )
      ORDER BY c.orden ASC
    `);

    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener resumen final", detalle: error });
  }
});

/**
 * POST /api/elecciones/:id/generar-reporte
 * Generar reporte de la elección
 */
router.post("/:id/generar-reporte", async (req, res) => {
  const { id } = req.params;
  const { formato = 'pdf', incluir_detalles = true } = req.body;
  
  try {
    // Aquí implementarías la lógica de generación de reportes
    // Por ahora retornamos los datos estructurados
    const datosReporte = await prisma.$queryRawUnsafe(`
      SELECT 
        e.nombre as eleccion_nombre,
        e.fecha,
        e.estado,
        cat.nombre as cargo_nombre,
        cand.nombre_completo as candidato_nombre,
        res.votos,
        r.numero_ronda,
        ROUND((res.votos * 100.0 / SUM(res.votos) OVER (PARTITION BY r.id_ronda)), 2) as porcentaje
      FROM Eleccion e
      JOIN Cargo c ON e.id_eleccion = c.id_eleccion
      JOIN CatalogoCargo cat ON c.id_catalogo = cat.id_catalogo
      JOIN Ronda r ON c.id_cargo = r.id_cargo
      JOIN Resultado res ON r.id_ronda = res.id_ronda
      JOIN Candidato cand ON res.id_candidato = cand.id_candidato
      WHERE e.id_eleccion = ${Number(id)}
      ORDER BY c.orden, r.numero_ronda, res.votos DESC
    `);

    res.json({
      mensaje: "Reporte generado exitosamente",
      formato,
      datos: datosReporte,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Error al generar reporte", detalle: error });
  }
});

export default router;