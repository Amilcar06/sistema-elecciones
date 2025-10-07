import React, { lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaVisualizacionResultados = lazy(() => 
  import('../components/PantallaVisualizacionResultados').then(module => ({
    default: module.PantallaVisualizacionResultados
  }))
);

export const AdminResultsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { currentElection, currentPosition, selectPosition } = useAppContext();

  if (!currentElection || !currentPosition) {
    navigate('/results');
    return null;
  }

  const handleNextPosition = (nextPosition: any) => {
    if (nextPosition) {
      selectPosition(nextPosition);
      navigate('/candidates');
    } else {
      navigate('/summary');
    }
  };

  const handleGoToSummary = () => {
    navigate('/summary');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <PantallaVisualizacionResultados
      election={currentElection}
      currentPosition={currentPosition}
      onNextPosition={handleNextPosition}
      onBack={() => navigate(-1)}
      onGoToSummary={handleGoToSummary}
      onHome={handleGoHome}
    />
  );
};
