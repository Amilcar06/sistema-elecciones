import React, { lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

// Lazy loading del componente
const PantallaInicioElecciones = lazy(() => 
  import('../components/PantallaInicioElecciones').then(module => ({
    default: module.PantallaInicioElecciones
  }))
);

export const HomeRoute: React.FC = () => {
  const navigate = useNavigate();
  const { handleCreateElection } = useAppContext();

  const handleCreateElectionWithNavigation = async (data: { nombre: string; descripcion?: string }) => {
    try {
      await handleCreateElection(data);
      navigate('/positions');
    } catch (error) {
      console.error('Error creando elección:', error);
    }
  };

  return (
    <PantallaInicioElecciones
      onCreateElection={handleCreateElectionWithNavigation}
      onViewHistory={() => navigate('/history')}
    />
  );
};
