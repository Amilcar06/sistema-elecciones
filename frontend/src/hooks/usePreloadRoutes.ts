import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Hook para precargar rutas basado en el flujo de navegación
export const usePreloadRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Precargar rutas basado en la ruta actual
    const preloadRoutes = async () => {
      const currentPath = location.pathname;

      try {
        switch (currentPath) {
          case '/':
            // Si estamos en home, precargar positions
            import('../routes/PositionsRoute');
            break;
          case '/positions':
            // Si estamos en positions, precargar candidates
            import('../routes/CandidatesRoute');
            break;
          case '/candidates':
            // Si estamos en candidates, precargar results
            import('../routes/ResultsRoute');
            break;
          case '/results':
            // Si estamos en results, precargar admin-results
            import('../routes/AdminResultsRoute');
            break;
          case '/admin-results':
            // Si estamos en admin-results, precargar summary
            import('../routes/SummaryRoute');
            break;
          case '/history':
            // Si estamos en history, precargar summary
            import('../routes/SummaryRoute');
            break;
        }
      } catch (error) {
        console.warn('Error precargando rutas:', error);
      }
    };

    // Precargar después de un pequeño delay para no bloquear la UI
    const timeoutId = setTimeout(preloadRoutes, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};
