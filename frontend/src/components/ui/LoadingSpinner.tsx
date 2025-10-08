import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from './utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'overlay' | 'page';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Cargando...', 
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const variantClasses = {
    default: 'flex flex-col items-center justify-center p-8',
    inline: 'flex items-center justify-center gap-2',
    overlay: 'absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50',
    page: 'min-h-screen bg-background flex items-center justify-center'
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary', variant === 'default' && 'mb-4')} />
      {text && (
        <p className={cn(
          'text-muted-foreground text-sm',
          variant === 'inline' && 'text-sm',
          variant === 'default' && 'text-sm',
          variant === 'page' && 'text-base mt-4'
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

// Componente de loading para botones
export const ButtonLoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />
  );
};

// Componente de loading para rutas
export const RouteLoadingSpinner: React.FC = () => {
  return (
    <LoadingSpinner 
      variant="page" 
      size="xl" 
      text="Cargando pantalla..." 
    />
  );
};

// Componente de loading para overlays
export const OverlayLoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Procesando...' }) => {
  return (
    <LoadingSpinner 
      variant="overlay" 
      size="lg" 
      text={text} 
    />
  );
};

// Componente de loading inline
export const InlineLoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => {
  return (
    <LoadingSpinner 
      variant="inline" 
      size="sm" 
      text={text} 
    />
  );
};
