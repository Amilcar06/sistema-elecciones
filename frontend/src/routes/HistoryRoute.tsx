import React, { lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaHistorialElecciones = lazy(() => 
  import('../components/PantallaHistorialElecciones').then(module => ({
    default: module.PantallaHistorialElecciones
  }))
);

export const HistoryRoute: React.FC = () => {
  const navigate = useNavigate();
  const { elections, selectElection, setElections, selectPosition } = useAppContext();

  const handleSelectElection = (eleccion: any) => {
    selectElection(eleccion);
    navigate('/summary');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleElectionUpdated = (updatedElection: any) => {
    setElections(prev => 
      prev.map(e => e.id_eleccion === updatedElection.id_eleccion ? updatedElection : e)
    );
  };

  const handleContinueElection = (election: any, targetScreen: string, position?: any) => {
    selectElection(election);
    if (position) {
      selectPosition(position);
    }
    navigate(`/${targetScreen}`);
  };

  return (
    <PantallaHistorialElecciones
      elections={elections}
      onSelectElection={handleSelectElection}
      onBack={() => navigate(-1)}
      onHome={handleGoHome}
      onElectionUpdated={handleElectionUpdated}
      onContinueElection={handleContinueElection}
    />
  );
};
