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
    
    // Verificar que el usuario existe y está activo
    const usuario = await prisma.usuario.findFirst({
      where: {
        id_usuario: decoded.id_usuario,
        estado: 'ACTIVO',
        deleted_at: null
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no válido o inactivo' });
    }

    // Verificar que la sesión existe y no ha expirado
    const sesion = await prisma.sesion.findFirst({
      where: {
        token,
        id_usuario: usuario.id_usuario,
        expires_at: {
          gt: new Date()
        },
        absolute_expiry: {
          gt: new Date()
        }
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
    
    // Implementar sliding window: extender la sesión por 1 hora desde el último acceso
    // pero no más allá del límite absoluto de 7 días
    const lastActivity = sesion.last_activity;
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Si han pasado más de 30 minutos desde la última actividad, extender la sesión
    if (hoursSinceLastActivity >= 0.5) {
      const newExpiry = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hora desde ahora
      
      // No extender más allá del límite absoluto
      const finalExpiry = newExpiry > sesion.absolute_expiry ? sesion.absolute_expiry : newExpiry;
      
      await prisma.sesion.update({
        where: { id_sesion: sesion.id_sesion },
        data: {
          expires_at: finalExpiry,
          last_activity: now
        }
      });
    }

    // Actualizar último acceso del usuario
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_acceso: now }
    });

    req.usuario = {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      estado: usuario.estado
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
      return res.status(403).json({ 
        error: 'Error de autenticación', 
        code: 'AUTH_ERROR',
        message: 'Error interno de autenticación.' 
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
