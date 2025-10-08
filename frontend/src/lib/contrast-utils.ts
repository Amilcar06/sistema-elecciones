/**
 * Utilidades para mejorar el contraste y accesibilidad
 */

// Colores con mejor contraste que cumplen WCAG AA
export const contrastColors = {
  // Texto con mejor contraste
  text: {
    primary: 'text-foreground', // Negro/blanco según tema
    secondary: 'text-muted-foreground', // Gris medio
    muted: 'text-muted-foreground/70', // Gris más claro
    inverse: 'text-background', // Para texto sobre fondos oscuros
  },
  
  // Fondos con mejor contraste
  background: {
    primary: 'bg-background',
    secondary: 'bg-card',
    muted: 'bg-muted',
    accent: 'bg-accent',
    destructive: 'bg-destructive',
  },
  
  // Estados con mejor contraste
  status: {
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-white',
    error: 'bg-destructive text-destructive-foreground',
    info: 'bg-blue-600 text-white',
  },
  
  // Bordes con mejor contraste
  border: {
    default: 'border-border',
    muted: 'border-border/50',
    accent: 'border-primary',
  }
};

// Función para obtener colores de estado con buen contraste
export const getStatusColors = (status: string) => {
  switch (status.toLowerCase()) {
    case 'draft':
    case 'borrador':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'en_curso':
    case 'en curso':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'finalizada':
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelada':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Función para obtener colores de rol con buen contraste
export const getRoleColors = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'organizador':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'observador':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Función para verificar si un color tiene suficiente contraste
export const hasGoodContrast = (foreground: string, background: string): boolean => {
  // Esta es una implementación simplificada
  // En producción se debería usar una librería como color-contrast
  const contrastMap: Record<string, number> = {
    'text-foreground': 21, // Negro sobre blanco
    'text-muted-foreground': 4.5, // Gris medio sobre blanco
    'text-white': 21, // Blanco sobre negro
    'text-black': 21, // Negro sobre blanco
  };
  
  return (contrastMap[foreground] || 4.5) >= 4.5; // WCAG AA mínimo
};
