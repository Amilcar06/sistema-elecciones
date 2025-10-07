import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Eleccion } from '../services/eleccionService';
import { Cargo } from '../services/cargoService';
import { getElecciones } from '../services/eleccionService';

interface AppContextType {
  // Estado de elecciones
  elections: Eleccion[];
  setElections: React.Dispatch<React.SetStateAction<Eleccion[]>>;
  currentElection: Eleccion | null;
  setCurrentElection: React.Dispatch<React.SetStateAction<Eleccion | null>>;
  
  // Estado de cargos
  currentPosition: Cargo | null;
  setCurrentPosition: React.Dispatch<React.SetStateAction<Cargo | null>>;
  
  // Funciones de elección
  handleCreateElection: (data: { nombre: string; descripcion?: string }) => Promise<void>;
  handleUpdateElection: (updated: Eleccion) => Promise<void>;
  handleChangeElectionState: (electionId: number, newState: "DRAFT" | "EN_CURSO" | "FINALIZADA") => Promise<Eleccion>;
  
  // Funciones de selección
  selectElection: (eleccion: Eleccion) => void;
  selectPosition: (position: Cargo) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [elections, setElections] = useState<Eleccion[]>([]);
  const [currentElection, setCurrentElection] = useState<Eleccion | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Cargo | null>(null);

  // Cargar elecciones al inicio
  useEffect(() => {
    const loadElections = async () => {
      try {
        const data = await getElecciones();
        setElections(data);
      } catch (error) {
        console.error("Error cargando elecciones", error);
      }
    };
    loadElections();
  }, []);

  // Crear nueva elección
  const handleCreateElection = async (data: { nombre: string; descripcion?: string }) => {
    try {
      const { crearEleccion } = await import('../services/eleccionService');
      const nuevaEleccion = await crearEleccion({
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: new Date().toISOString(),
        anio: new Date().getFullYear(),
      });
      setElections((prev) => [...prev, nuevaEleccion]);
      setCurrentElection(nuevaEleccion);
    } catch (err) {
      console.error("Error creando elección", err);
      throw err;
    }
  };

  // Actualizar elección
  const handleUpdateElection = async (updated: Eleccion) => {
    try {
      const { actualizarEleccion } = await import('../services/eleccionService');
      const eleccionActualizada = await actualizarEleccion(updated.id_eleccion, {
        nombre: updated.nombre,
        descripcion: updated.descripcion,
        fecha: updated.fecha,
        anio: updated.anio,
        estado: updated.estado,
      });
      setCurrentElection(eleccionActualizada);
      setElections((prev) =>
        prev.map((e) =>
          e.id_eleccion === eleccionActualizada.id_eleccion
            ? eleccionActualizada
            : e
        )
      );
    } catch (err) {
      console.error("Error actualizando elección", err);
      throw err;
    }
  };

  // Cambiar estado de elección
  const handleChangeElectionState = async (electionId: number, newState: "DRAFT" | "EN_CURSO" | "FINALIZADA") => {
    try {
      const { cambiarEstadoEleccion } = await import('../services/eleccionService');
      const updatedElection = await cambiarEstadoEleccion(electionId, newState);
      
      if (currentElection && currentElection.id_eleccion === electionId) {
        setCurrentElection(updatedElection);
      }
      
      setElections((prev) =>
        prev.map((e) =>
          e.id_eleccion === electionId ? updatedElection : e
        )
      );
      
      return updatedElection;
    } catch (error) {
      console.error('Error cambiando estado de elección:', error);
      throw error;
    }
  };

  // Seleccionar elección
  const selectElection = (eleccion: Eleccion) => {
    setCurrentElection(eleccion);
  };

  // Seleccionar cargo
  const selectPosition = (position: Cargo) => {
    setCurrentPosition(position);
  };

  const value: AppContextType = {
    elections,
    setElections,
    currentElection,
    setCurrentElection,
    currentPosition,
    setCurrentPosition,
    handleCreateElection,
    handleUpdateElection,
    handleChangeElectionState,
    selectElection,
    selectPosition,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
