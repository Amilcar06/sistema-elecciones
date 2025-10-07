import React, { lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaResumenFinal = lazy(() => 
  import('../components/PantallaResumenFinal').then(module => ({
    default: module.PantallaResumenFinal
  }))
);

export const SummaryRoute: React.FC = () => {
  const navigate = useNavigate();
  const { currentElection, handleChangeElectionState } = useAppContext();

  if (!currentElection) {
    navigate('/');
    return null;
  }

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <PantallaResumenFinal
      election={currentElection}
      onBack={() => navigate(-1)}
      onHome={handleGoHome}
      onChangeElectionState={handleChangeElectionState}
    />
  );
};
