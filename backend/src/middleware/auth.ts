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
        }
      }
    });

    if (!sesion) {
      return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id_usuario: usuario.id_usuario },
      data: { ultimo_acceso: new Date() }
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
    return res.status(403).json({ error: 'Token inválido' });
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
export const requireOrganizador = requireRole(['ADMIN', 'ORGANIZADOR']);
export const requireObservador = requireRole(['ADMIN', 'ORGANIZADOR', 'OBSERVADOR']);
