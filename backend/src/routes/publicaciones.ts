import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/publicaciones
 * Listar todas las publicaciones
 */
router.get("/", async (req, res) => {
  try {
    const publicaciones = await prisma.publicacionResultado.findMany({
      include: {
        eleccion: {
          select: { id_eleccion: true, nombre: true, fecha: true }
        }
      },
      orderBy: { fecha_publicacion: "desc" }
    });
    
    res.json(publicaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al listar publicaciones", detalle: error });
  }
});

/**
 * GET /api/publicaciones/:id
 * Obtener una publicación específica
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const publicacion = await prisma.publicacionResultado.findUnique({
      where: { id_publicacion: Number(id) },
      include: {
        eleccion: true
      }
    });

    if (!publicacion) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json(publicacion);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener publicación", detalle: error });
  }
});

/**
 * POST /api/publicaciones
 * Registrar nueva publicación
 */
router.post("/", async (req, res) => {
  try {
    const { id_eleccion, nota, publicado_por, modo = 'PROYECTOR' } = req.body;

    if (!id_eleccion) {
      return res.status(400).json({ error: "id_eleccion es obligatorio" });
    }

    const publicacion = await prisma.publicacionResultado.create({
      data: {
        id_eleccion: Number(id_eleccion),
        nota,
        publicado_por,
        modo
      },
      include: {
        eleccion: true
      }
    });

    res.status(201).json(publicacion);
  } catch (error) {
    res.status(400).json({ error: "Error al crear publicación", detalle: error });
  }
});

/**
 * PUT /api/publicaciones/:id
 * Actualizar publicación
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nota, publicado_por, modo } = req.body;

  try {
    const actualizada = await prisma.publicacionResultado.update({
      where: { id_publicacion: Number(id) },
      data: {
        nota: nota || undefined,
        publicado_por: publicado_por || undefined,
        modo: modo || undefined,
      },
      include: {
        eleccion: true
      }
    });

    res.json(actualizada);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }
    res.status(400).json({ error: "Error actualizando publicación", detalle: error });
  }
});

/**
 * DELETE /api/publicaciones/:id
 * Eliminar publicación
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.publicacionResultado.delete({
      where: { id_publicacion: Number(id) },
    });
    res.json({ message: "Publicación eliminada" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }
    res.status(400).json({ error: "Error eliminando publicación", detalle: error });
  }
});

/**
 * GET /api/elecciones/:id/publicaciones
 * Obtener publicaciones de una elección específica
 */
router.get("/elecciones/:id/publicaciones", async (req, res) => {
  const { id } = req.params;
  try {
    const publicaciones = await prisma.publicacionResultado.findMany({
      where: { id_eleccion: Number(id) },
      orderBy: { fecha_publicacion: "desc" }
    });
    
    res.json(publicaciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener publicaciones", detalle: error });
  }
});

export default router;
