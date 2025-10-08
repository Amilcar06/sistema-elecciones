import React, { lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaRegistroCandidatos = lazy(() => 
  import('../components/PantallaRegistroCandidatos').then(module => ({
    default: module.PantallaRegistroCandidatos
  }))
);

export const CandidatesRoute: React.FC = () => {
  const navigate = useNavigate();
  const { currentPosition, setCurrentPosition } = useAppContext();

  useEffect(() => {
    if (!currentPosition) {
      navigate('/positions');
    }
  }, [currentPosition, navigate]);

  if (!currentPosition) {
    return null;
  }

  const handleUpdatePosition = (updatedPosition: any) => {
    setCurrentPosition(updatedPosition);
  };

  return (
    <PantallaRegistroCandidatos
      position={currentPosition}
      onUpdatePosition={handleUpdatePosition}
      onStartVoting={() => navigate('/results')}
      onBack={() => navigate(-1)}
    />
  );
};
