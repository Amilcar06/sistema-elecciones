import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import prisma from '../prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  authRateLimit, 
  validateEmail, 
  validatePassword, 
  validateNombre, 
  validateApellido,
  validateRequest,
  getRealIP
} from '../middleware/security';

const router = Router();

// Aplicar rate limiting a todas las rutas de auth
router.use(authRateLimit);
router.use(getRealIP);

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (solo admin)
 */
router.post('/register', 
  authenticateToken,
  requireAdmin,
  validateEmail,
  validatePassword,
  validateNombre,
  validateApellido,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password, nombre, apellido, rol = 'ORGANIZADOR' } = req.body;

      // Verificar si el email ya existe
      const existingUser = await prisma.usuario.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const usuario = await prisma.usuario.create({
        data: {
          email,
          password_hash,
          nombre,
          apellido,
          rol,
          estado: 'ACTIVO'
        },
        select: {
          id_usuario: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          estado: true,
          created_at: true
        }
      });

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        usuario
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', 
  validateEmail,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar estado del usuario
      if (usuario.estado !== 'ACTIVO') {
        return res.status(401).json({ error: 'Usuario inactivo o suspendido' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, usuario.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar JWT
      const token = jwt.sign(
        { 
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      // Crear sesión
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.sesion.create({
        data: {
          id_usuario: usuario.id_usuario,
          token,
          expires_at: expiresAt,
          ip_address: (req as any).realIP || req.ip,
          user_agent: req.headers['user-agent']
        }
      });

      // Actualizar último acceso
      await prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: { ultimo_acceso: new Date() }
      });

      res.json({
        message: 'Login exitoso',
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          estado: usuario.estado
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Eliminar sesión
      await prisma.sesion.deleteMany({
        where: { token }
      });
    }

    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.usuario!.id_usuario },
      select: {
        id_usuario: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        estado: true,
        ultimo_acceso: true,
        created_at: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña
 */
router.put('/change-password',
  authenticateToken,
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nueva contraseña debe tener al menos 8 caracteres'),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.usuario!.id_usuario;

      // Obtener usuario actual
      const usuario = await prisma.usuario.findUnique({
        where: { id_usuario: userId }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, usuario.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }

      // Hash nueva contraseña
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await prisma.usuario.update({
        where: { id_usuario: userId },
        data: { password_hash: newPasswordHash }
      });

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

export default router;
