import React, { lazy } from 'react';
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

  if (!currentPosition || !currentElection) {
    navigate('/candidates');
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
