import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireAdmin, requireOrganizador } from '../middleware/auth';
import { auditMiddleware } from '../middleware/security';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

/**
 * GET /api/dashboard/stats
 * Estadísticas generales del sistema
 */
router.get('/stats', requireOrganizador, async (req: Request, res: Response) => {
  try {
    const [
      totalUsuarios,
      totalElecciones,
      eleccionesActivas,
      totalCargos,
      totalCandidatos,
      totalResultados,
      usuariosActivos,
      eleccionesPorEstado
    ] = await Promise.all([
      prisma.usuario.count({ where: { deleted_at: null } }),
      prisma.eleccion.count({ where: { deleted_at: null } }),
      prisma.eleccion.count({ where: { estado: 'EN_CURSO', deleted_at: null } }),
      prisma.cargo.count({ where: { deleted_at: null } }),
      prisma.candidato.count({ where: { deleted_at: null } }),
      prisma.resultado.count({ where: { deleted_at: null } }),
      prisma.usuario.count({ where: { estado: 'ACTIVO', deleted_at: null } }),
      prisma.eleccion.groupBy({
        by: ['estado'],
        where: { deleted_at: null },
        _count: { estado: true }
      })
    ]);

    res.json({
      usuarios: {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: totalUsuarios - usuariosActivos
      },
      elecciones: {
        total: totalElecciones,
        activas: eleccionesActivas,
        porEstado:       eleccionesPorEstado.reduce((acc: Record<string, number>, item: any) => {
        acc[item.estado] = item._count.estado;
        return acc;
      }, {} as Record<string, number>)
      },
      contenido: {
        cargos: totalCargos,
        candidatos: totalCandidatos,
        resultados: totalResultados
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/dashboard/usuarios
 * Listar usuarios (solo admin)
 */
router.get('/usuarios', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', rol = '', estado = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { deleted_at: null };
    
    if (search) {
      where.OR = [
        { nombre: { contains: search as string, mode: 'insensitive' } },
        { apellido: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (rol) where.rol = rol;
    if (estado) where.estado = estado;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          estado: true,
          ultimo_acceso: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.usuario.count({ where })
    ]);

    res.json({
      usuarios,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/dashboard/usuarios/:id
 * Actualizar usuario (solo admin)
 */
router.put('/usuarios/:id', 
  requireAdmin,
  auditMiddleware('UPDATE', 'Usuario'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nombre, apellido, rol, estado } = req.body;

      const usuario = await prisma.usuario.update({
        where: { id_usuario: Number(id) },
        data: { nombre, apellido, rol, estado },
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          estado: true,
          updated_at: true
        }
      });

      res.json({
        message: 'Usuario actualizado exitosamente',
        usuario
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

/**
 * DELETE /api/dashboard/usuarios/:id
 * Eliminar usuario (soft delete, solo admin)
 */
router.delete('/usuarios/:id', 
  requireAdmin,
  auditMiddleware('DELETE', 'Usuario'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = Number(id);

      // No permitir auto-eliminación
      if (userId === req.usuario!.id_usuario) {
        return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
      }

      await prisma.usuario.update({
        where: { id_usuario: userId },
        data: { 
          deleted_at: new Date(),
          estado: 'INACTIVO'
        }
      });

      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

/**
 * GET /api/dashboard/auditoria
 * Obtener logs de auditoría (solo admin)
 */
router.get('/auditoria', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, tabla = '', accion = '', fechaDesde = '', fechaHasta = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (tabla) where.tabla = tabla;
    if (accion) where.accion = accion;
    
    if (fechaDesde || fechaHasta) {
      where.created_at = {};
      if (fechaDesde) where.created_at.gte = new Date(fechaDesde as string);
      if (fechaHasta) where.created_at.lte = new Date(fechaHasta as string);
    }

    const [auditorias, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: {
          usuario: {
            select: {
              id_usuario: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.auditoria.count({ where })
    ]);

    res.json({
      auditorias,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo auditoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/dashboard/elecciones
 * Listar elecciones con filtros
 */
router.get('/elecciones', requireOrganizador, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', estado = '', usuario = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { deleted_at: null };
    
    if (search) {
      where.OR = [
        { nombre: { contains: search as string, mode: 'insensitive' } },
        { descripcion: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (estado) where.estado = estado;
    if (usuario) where.id_usuario_creador = Number(usuario);

    const [elecciones, total] = await Promise.all([
      prisma.eleccion.findMany({
        where,
        include: {
          usuario_creador: {
            select: {
              id_usuario: true,
              nombre: true,
              apellido: true,
              email: true
            }
          },
          _count: {
            select: {
              cargos: true,
              publicaciones: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.eleccion.count({ where })
    ]);

    res.json({
      elecciones,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error listando elecciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/dashboard/elecciones/:id
 * Eliminar elección (soft delete con cascada)
 */
router.delete('/elecciones/:id', 
  requireAdmin,
  auditMiddleware('DELETE', 'Eleccion'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const eleccionId = Number(id);

      // Verificar que la elección existe
      const eleccion = await prisma.eleccion.findUnique({
        where: { id_eleccion: eleccionId },
        include: {
          _count: {
            select: {
              cargos: true,
              publicaciones: true
            }
          }
        }
      });

      if (!eleccion) {
        return res.status(404).json({ error: 'Elección no encontrada' });
      }

      // Eliminación en cascada (soft delete)
      const now = new Date();
      
      await prisma.$transaction(async (tx) => {
        // Eliminar resultados
        await tx.resultado.updateMany({
          where: {
            ronda: {
              cargo: {
                id_eleccion: eleccionId
              }
            }
          },
          data: { deleted_at: now }
        });

        // Eliminar rondas
        await tx.ronda.updateMany({
          where: {
            cargo: {
              id_eleccion: eleccionId
            }
          },
          data: { deleted_at: now }
        });

        // Eliminar candidatos
        await tx.candidato.updateMany({
          where: {
            cargo: {
              id_eleccion: eleccionId
            }
          },
          data: { deleted_at: now }
        });

        // Eliminar cargos
        await tx.cargo.updateMany({
          where: { id_eleccion: eleccionId },
          data: { deleted_at: now }
        });

        // Eliminar publicaciones
        await tx.publicacionResultado.updateMany({
          where: { id_eleccion: eleccionId },
          data: { deleted_at: now }
        });

        // Eliminar elección
        await tx.eleccion.update({
          where: { id_eleccion: eleccionId },
          data: { deleted_at: now }
        });
      });

      res.json({ 
        message: 'Elección eliminada exitosamente',
        elementosEliminados: {
          elecciones: 1,
          cargos: eleccion._count.cargos,
          publicaciones: eleccion._count.publicaciones
        }
      });
    } catch (error) {
      console.error('Error eliminando elección:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
