import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

// Extender el tipo Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id_usuario: number;
        email: string;
        nombre: string;
        apellido: string;
        rol: string;
        estado: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Verificar usuario y sesión en una sola consulta optimizada
    const sesion = await prisma.sesion.findFirst({
      where: {
        token,
        id_usuario: decoded.id_usuario,
        expires_at: { gt: new Date() },
        absolute_expiry: { gt: new Date() },
        usuario: {
          estado: 'ACTIVO',
          deleted_at: null
        }
      },
      include: {
        usuario: true
      }
    });

    if (!sesion) {
      return res.status(401).json({ 
        error: 'Sesión expirada o inválida',
        code: 'SESSION_EXPIRED',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
    }

    const now = new Date();
    
    // Solo actualizar si han pasado más de 5 minutos (reducir frecuencia de actualizaciones)
    const minutesSinceLastActivity = (now.getTime() - sesion.last_activity.getTime()) / (1000 * 60);
    
    if (minutesSinceLastActivity >= 5) {
      // Usar transacción para operaciones atómicas
      await prisma.$transaction(async (tx) => {
        const newExpiry = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hora desde ahora
        const finalExpiry = newExpiry > sesion.absolute_expiry ? sesion.absolute_expiry : newExpiry;
        
        await tx.sesion.update({
          where: { id_sesion: sesion.id_sesion },
          data: {
            expires_at: finalExpiry,
            last_activity: now
          }
        });

        // Actualizar último acceso del usuario (menos frecuente)
        await tx.usuario.update({
          where: { id_usuario: sesion.usuario.id_usuario },
          data: { ultimo_acceso: now }
        });
      });
    }

    req.usuario = {
      id_usuario: sesion.usuario.id_usuario,
      email: sesion.usuario.email,
      nombre: sesion.usuario.nombre,
      apellido: sesion.usuario.apellido,
      rol: sesion.usuario.rol,
      estado: sesion.usuario.estado
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Token expirado', 
        code: 'TOKEN_EXPIRED',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'TOKEN_INVALID',
        message: 'Token de autenticación no válido.' 
      });
    } else {
      return res.status(401).json({ 
        error: 'Sesión inválida', 
        code: 'SESSION_INVALID',
        message: error instanceof Error ? error.message : 'Error de autenticación.' 
      });
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireUsuario = requireRole(['ADMIN', 'USUARIO']);

// Mantener compatibilidad con código existente
export const requireOrganizador = requireRole(['ADMIN']); // ADMIN puede hacer todo lo que hacía ORGANIZADOR
export const requireObservador = requireRole(['ADMIN', 'USUARIO']); // Ambos roles pueden observar
