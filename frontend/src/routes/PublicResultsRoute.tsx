import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';

// Lazy loading del componente
const PantallaPublicaResultados = lazy(() => 
  import('../components/PantallaPublicaResultados').then(module => ({
    default: module.PantallaPublicaResultados
  }))
);

export const PublicResultsRoute: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();

  if (!electionId) {
    return <div>Error: ID de elección no encontrado</div>;
  }

  return (
    <PantallaPublicaResultados 
      electionId={parseInt(electionId)}
      autoRefreshInterval={3000}
    />
  );
};
