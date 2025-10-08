import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { useFadeIn, useHoverAnimation } from '../../hooks/useAnimations';
import { cn } from './utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  pulseEffect?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  hoverEffect = true,
  pulseEffect = false,
}) => {
  const isVisible = useFadeIn(delay);
  const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverAnimation();

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4',
        hoverEffect && isHovered && 'transform scale-105 shadow-lg',
        pulseEffect && 'animate-pulse',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Componente para animaciones de entrada escalonadas
interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 100,
  className,
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedCard key={index} delay={index * staggerDelay}>
          {child}
        </AnimatedCard>
      ))}
    </div>
  );
};

// Componente para animaciones de loading con skeleton
interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  lines = 3,
}) => {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-3 bg-muted rounded mb-2"></div>
        ))}
      </CardContent>
    </Card>
  );
};
