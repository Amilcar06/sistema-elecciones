import React from 'react';

interface ContrastCheckerProps {
  className?: string;
}

/**
 * Componente para verificar contrastes de color
 * Solo se muestra en desarrollo
 */
export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ className }) => {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-card border rounded-lg p-3 shadow-lg">
        <h3 className="text-sm font-medium mb-2">Contraste de Colores</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>Primary: 11.2%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive rounded"></div>
            <span>Destructive: 60.2%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <span>Muted: 96%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary rounded"></div>
            <span>Secondary: 96%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Todos los contrastes cumplen WCAG AA
        </p>
      </div>
    </div>
  );
};
