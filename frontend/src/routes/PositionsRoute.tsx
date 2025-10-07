import React, { lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaGestionCargos = lazy(() => 
  import('../components/PantallaGestionCargos').then(module => ({
    default: module.PantallaGestionCargos
  }))
);

export const PositionsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { currentElection, handleUpdateElection, selectPosition } = useAppContext();

  if (!currentElection) {
    navigate('/');
    return null;
  }

  const handleContinue = (position: any) => {
    selectPosition(position);
    navigate('/candidates');
  };

  return (
    <PantallaGestionCargos
      election={currentElection}
      onUpdateElection={handleUpdateElection}
      onContinue={handleContinue}
      onBack={() => navigate(-1)}
    />
  );
};
