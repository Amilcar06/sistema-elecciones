import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import prisma from '../prisma';

// Rate limiting
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message || 'Demasiadas solicitudes, intenta más tarde' },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limits específicos
export const authRateLimit = createRateLimit(
  1 * 60 * 1000,  // ventana de 1 minuto
  100,            // aumentar a 100 intentos
  'Demasiados intentos de login, intenta en 1 minuto'
);

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  200,            // aumentar a 200 requests por IP (menos restrictivo)
  'Demasiadas solicitudes a la API'
);

export const loginRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  process.env.NODE_ENV === 'development' ? 50 : 5, // 50 en desarrollo, 5 en producción
  'Demasiados intentos de login, intenta en 15 minutos'
);

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Validación de entrada
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      detalles: errors.array()
    });
  }
  next();
};

// Validaciones comunes
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email inválido');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('La contraseña debe tener al menos 8 caracteres')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número');

export const validateNombre = body('nombre')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('El nombre debe tener entre 2 y 100 caracteres');

export const validateApellido = body('apellido')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('El apellido debe tener entre 2 y 100 caracteres');

// Middleware de auditoría
export const auditMiddleware = (action: string, tabla: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Solo auditar si la respuesta fue exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditData = {
          tabla,
          accion: action,
          id_registro: req.params.id ? parseInt(req.params.id) : 0,
          datos_anteriores: req.body?.datos_anteriores || null,
          datos_nuevos: req.body || null,
          id_usuario: req.usuario?.id_usuario || null,
          ip_address: (req as any).realIP || req.ip || req.connection.remoteAddress,
        };

        // Ejecutar auditoría de forma asíncrona
        prisma.auditoria.create({ data: auditData }).catch(console.error);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware para obtener IP real
export const getRealIP = (req: Request, res: Response, next: NextFunction) => {
  const realIP = req.headers['x-forwarded-for'] as string || 
                 req.headers['x-real-ip'] as string || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 'unknown';
  
  // Asignar la IP real a una propiedad personalizada
  (req as any).realIP = realIP;
  next();
};

export const corsDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('🌐 Request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: {
      'access-control-request-headers': req.headers['access-control-request-headers'],
      'access-control-request-method': req.headers['access-control-request-method'],
    }
  });
  next();
};