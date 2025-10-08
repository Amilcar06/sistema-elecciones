import React, { lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaIngresoResultados = lazy(() => 
  import('../components/PantallaIngresoResultados').then(module => ({
    default: module.PantallaIngresoResultados
  }))
);

export const ResultsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { currentPosition, currentElection, setCurrentPosition, handleChangeElectionState } = useAppContext();

  useEffect(() => {
    if (!currentPosition || !currentElection) {
      navigate('/candidates');
    }
  }, [currentPosition, currentElection, navigate]);

  if (!currentPosition || !currentElection) {
    return null;
  }

  const handleUpdatePosition = (updatedPosition: any) => {
    setCurrentPosition(updatedPosition);
  };

  return (
    <PantallaIngresoResultados
      position={currentPosition}
      election={currentElection}
      onUpdatePosition={handleUpdatePosition}
      onViewResults={() => navigate('/admin-results')}
      onBack={() => navigate(-1)}
      onChangeElectionState={handleChangeElectionState}
    />
  );
};
