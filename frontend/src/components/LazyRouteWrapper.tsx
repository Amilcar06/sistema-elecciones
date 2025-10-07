import React, { Suspense } from 'react';
import { RouteLoadingSpinner } from './ui/LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';

interface LazyRouteWrapperProps {
  children: React.ReactNode;
}

export const LazyRouteWrapper: React.FC<LazyRouteWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
