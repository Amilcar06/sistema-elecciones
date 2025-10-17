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
      
      // Log inicio de intento de login
      console.log(`🔑 Intento de login para: ${email} - ${new Date().toISOString()}`);

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

      const now = new Date();
      
      // Generar access token (1 hora)
      const accessToken = jwt.sign(
        { 
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          rol: usuario.rol,
          type: 'access'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );

      // Generar refresh token (7 días)
      const refreshToken = jwt.sign(
        { 
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          type: 'refresh'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Log tamaño de tokens
      console.log({
        tokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length,
        tokenPreview: `${accessToken.substring(0, 50)}...`,
        refreshTokenPreview: `${refreshToken.substring(0, 50)}...`
      });

      // Limpiar sesiones antiguas antes de crear una nueva
      await prisma.sesion.deleteMany({
        where: {
          OR: [
            { expires_at: { lt: new Date() } },
            { last_activity: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
          ],
          id_usuario: usuario.id_usuario
        }
      });

      // Verificar sesiones simultáneas
      const activeSessions = await prisma.sesion.count({
        where: {
          id_usuario: usuario.id_usuario,
          expires_at: { gt: new Date() }
        }
      });

      console.log(`👤 Sesiones activas para ${email}: ${activeSessions}`);

      // Crear nueva sesión
      const sesion = await prisma.sesion.create({
        data: {
          id_usuario: usuario.id_usuario,
          token: accessToken,
          refresh_token: refreshToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
          absolute_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        }
      });

      console.log(`Login exitoso para ${email} - Session ID: ${sesion.id_sesion}`);

      // Actualizar último acceso
      await prisma.usuario.update({
        where: { id_usuario: usuario.id_usuario },
        data: { ultimo_acceso: new Date() }
      });

      res.json({
        message: 'Login exitoso',
        token: accessToken,
        refreshToken: refreshToken,
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
 * POST /api/auth/refresh
 * Refrescar access token usando refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar que la sesión existe y el refresh token es válido
    const sesion = await prisma.sesion.findFirst({
      where: {
        refresh_token: refreshToken,
        id_usuario: decoded.id_usuario,
        absolute_expiry: {
          gt: new Date()
        }
      },
      include: {
        usuario: true
      }
    });

    if (!sesion || sesion.usuario.estado !== 'ACTIVO') {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    const now = new Date();
    
    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { 
        id_usuario: sesion.usuario.id_usuario,
        email: sesion.usuario.email,
        rol: sesion.usuario.rol,
        type: 'access'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Actualizar sesión con nuevo access token
    const newAccessTokenExpiry = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hora
    
    await prisma.sesion.update({
      where: { id_sesion: sesion.id_sesion },
      data: {
        token: newAccessToken,
        expires_at: newAccessTokenExpiry,
        last_activity: now
      }
    });

    res.json({
      message: 'Token refrescado exitosamente',
      token: newAccessToken,
      refreshToken: refreshToken // Mantener el mismo refresh token
    });

  } catch (error) {
    console.error('Error refrescando token:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Refresh token expirado' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Eliminar sesión completa (incluye ambos tokens)
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
