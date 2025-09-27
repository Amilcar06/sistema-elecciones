import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/candidatos
 * Listar candidatos con filtros opcionales
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { id_cargo, activo } = req.query;
    
    const where: any = {};
    if (id_cargo) where.id_cargo = Number(id_cargo);
    if (activo !== undefined) where.activo = activo === 'true';

    const candidatos = await prisma.candidato.findMany({
      where,
      include: {
        cargo: {
          include: {
            catalogo: true,
            eleccion: true
          }
        }
      },
      orderBy: { created_at: "asc" }
    });
    
    res.json(candidatos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar candidatos", detalle: error });
  }
});

/**
 * GET /api/candidatos/:id
 * Obtener un candidato específico
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const candidato = await prisma.candidato.findUnique({
      where: { id_candidato: Number(id) },
      include: {
        cargo: {
          include: {
            catalogo: true,
            eleccion: true
          }
        },
        resultados: {
          include: {
            ronda: true
          }
        }
      }
    });

    if (!candidato) {
      return res.status(404).json({ error: "Candidato no encontrado" });
    }

    res.json(candidato);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener candidato", detalle: error });
  }
});

/**
 * POST /api/candidatos
 * Crear nuevo candidato
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { id_cargo, nombre, activo } = req.body;

    if (!id_cargo || !nombre) {
      return res.status(400).json({ 
        error: "id_cargo y nombre son obligatorios" 
      });
    }

    const nuevo = await prisma.candidato.create({
      data: {
        id_cargo: Number(id_cargo),
        nombre_completo: nombre,
        activo: activo !== undefined ? Boolean(activo) : true,
      },
      include: {
        cargo: {
          include: {
            catalogo: true,
            eleccion: true
          }
        }
      }
    });

    res.status(201).json(nuevo);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Ya existe un candidato con ese nombre en este cargo" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "El cargo no existe" });
    }
    res.status(400).json({ error: "Error creando candidato", detalle: error });
  }
});

/**
 * PUT /api/candidatos/:id
 * Actualizar candidato
 */
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, activo } = req.body;

  try {
    const actualizado = await prisma.candidato.update({
      where: { id_candidato: Number(id) },
      data: {
        nombre_completo: nombre || undefined,
        activo: activo !== undefined ? Boolean(activo) : undefined,
      },
      include: {
        cargo: {
          include: {
            catalogo: true,
            eleccion: true
          }
        }
      }
    });

    res.json(actualizado);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Candidato no encontrado" });
    }
    res.status(400).json({ error: "Error actualizando candidato", detalle: error });
  }
});

/**
 * DELETE /api/candidatos/:id
 * Eliminar candidato
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.candidato.delete({
      where: { id_candidato: Number(id) },
    });
    res.json({ message: "Candidato eliminado" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Candidato no encontrado" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "No se puede eliminar, el candidato tiene resultados" });
    }
    res.status(400).json({ error: "Error eliminando candidato", detalle: error });
  }
});

export default router;
