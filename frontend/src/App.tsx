import React, { useEffect, useState } from "react";
import { PantallaInicioElecciones } from "./components/PantallaInicioElecciones";
import { PantallaGestionCargos } from "./components/PantallaGestionCargos";
import { PantallaRegistroCandidatos } from "./components/PantallaRegistroCandidatos";
import { PantallaIngresoResultados } from "./components/PantallaIngresoResultados";
import { PantallaVisualizacionPublica } from "./components/PantallaVisualizacionPublica";
import { PantallaResumenFinal } from "./components/PantallaResumenFinal";
import { PantallaHistorialElecciones } from "./components/PantallaHistorialElecciones";

import {
  Eleccion,
  getElecciones,
  crearEleccion,
  actualizarEleccion,
  cambiarEstadoEleccion,
} from "./services/eleccionService";
import { Cargo } from "./services/cargoService";

type Screen =
  | "home"
  | "positions"
  | "candidates"
  | "results"
  | "public"
  | "summary"
  | "history";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [currentElection, setCurrentElection] = useState<Eleccion | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Cargo | null>(null);
  const [elections, setElections] = useState<Eleccion[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>(["home"]);

  // Cargar elecciones al inicio
  useEffect(() => {
    (async () => {
      try {
        const data = await getElecciones();
        setElections(data);
      } catch (error) {
        console.error("Error cargando elecciones", error);
      }
    })();
  }, []);

  // Navegación entre pantallas
  const navigateToScreen = (screen: Screen, addToHistory: boolean = true) => {
    console.log(`Navegando a: ${screen}, agregar al historial: ${addToHistory}`);
    setCurrentScreen(screen);
    if (addToHistory) {
      setNavigationHistory(prev => {
        const newHistory = [...prev, screen];
        console.log("Nuevo historial:", newHistory);
        return newHistory;
      });
    }
  };

  // Navegación hacia atrás
  const navigateBack = () => {
    console.log("Navegando hacia atrás. Historial actual:", navigationHistory);
    
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remover la pantalla actual
      const previousScreen = newHistory[newHistory.length - 1];
      console.log("Pantalla anterior:", previousScreen);
      setNavigationHistory(newHistory);
      setCurrentScreen(previousScreen);
    } else {
      // Si no hay historial, ir al home
      console.log("No hay historial, yendo al home");
      setCurrentScreen("home");
      setNavigationHistory(["home"]);
    }
  };

  // Crear nueva elección (API)
  const handleCreateElection = async (data: { nombre: string; descripcion?: string }) => {
    try {
      const nuevaEleccion = await crearEleccion({
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: new Date().toISOString(),
        anio: new Date().getFullYear(),
      });
      setElections((prev) => [...prev, nuevaEleccion]);
      setCurrentElection(nuevaEleccion);
      navigateToScreen("positions");
    } catch (err) {
      console.error("Error creando elección", err);
    }
  };

  // Actualizar elección en backend y estado local
  const handleUpdateElection = async (updated: Eleccion) => {
    try {
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
    }
  };

  // Seleccionar elección del historial
  const selectElection = (eleccion: Eleccion) => {
    setCurrentElection(eleccion);
  };

  // Seleccionar un cargo/posición
  const selectPosition = (position: Cargo) => {
    setCurrentPosition(position);
  };

  // Cambiar estado de elección y actualizar estado local
  const handleChangeElectionState = async (electionId: number, newState: "DRAFT" | "EN_CURSO" | "FINALIZADA") => {
    try {
      const updatedElection = await cambiarEstadoEleccion(electionId, newState);
      
      // Actualizar la elección actual si es la misma
      if (currentElection && currentElection.id_eleccion === electionId) {
        setCurrentElection(updatedElection);
      }
      
      // Actualizar en la lista de elecciones
      setElections((prev) =>
        prev.map((e) =>
          e.id_eleccion === electionId ? updatedElection : e
        )
      );
      
      console.log(`Estado de elección ${electionId} cambiado a ${newState}`);
      return updatedElection;
    } catch (error) {
      console.error('Error cambiando estado de elección:', error);
      throw error;
    }
  };

  // Render según pantalla actual
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <PantallaInicioElecciones
            onCreateElection={handleCreateElection}
            onViewHistory={() => navigateToScreen("history")}
          />
        );
      case "positions":
        return (
          <PantallaGestionCargos
            election={currentElection}
            onUpdateElection={handleUpdateElection}
            onContinue={(position) => {
              setCurrentPosition(position);
              navigateToScreen("candidates");
            }}
            onBack={navigateBack}
          />
        );
      case "candidates":
        return (
          <PantallaRegistroCandidatos
            position={currentPosition}
            onUpdatePosition={(updatedPosition) => {
              setCurrentPosition(updatedPosition);
            }}
            onStartVoting={() => navigateToScreen("results")}
            onBack={navigateBack}
          />
        );
      case "results":
        return (
          <PantallaIngresoResultados
            position={currentPosition}
            election={currentElection}
            onUpdatePosition={(updatedPosition) => {
              setCurrentPosition(updatedPosition);
            }}
            onPublicDisplay={() => navigateToScreen("public")}
            onBack={navigateBack}
            onChangeElectionState={handleChangeElectionState}
          />
        );
      case "public":
        return (
          <PantallaVisualizacionPublica
            election={currentElection}
            currentPosition={currentPosition}
            onNextPosition={(nextPosition) => {
              if (nextPosition) {
                setCurrentPosition(nextPosition);
                navigateToScreen("candidates");
              } else {
                navigateToScreen("summary");
              }
            }}
            onBack={navigateBack}
            onGoToSummary={() => navigateToScreen("summary")}
            onHome={() => {
              setCurrentScreen("home");
              setNavigationHistory(["home"]);
            }}
          />
        );
      case "summary":
        return (
          <PantallaResumenFinal
            election={currentElection}
            onBack={navigateBack}
            onHome={() => {
              setCurrentScreen("home");
              setNavigationHistory(["home"]);
            }}
            onChangeElectionState={handleChangeElectionState}
          />
        );
      case "history":
        return (
          <PantallaHistorialElecciones
            elections={elections}
            onSelectElection={(eleccion) => {
              selectElection(eleccion);
              navigateToScreen("summary");
            }}
            onBack={navigateBack}
            onHome={() => {
              setCurrentScreen("home");
              setNavigationHistory(["home"]);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Debug info - solo en desarrollo */}
      {false && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Pantalla actual: <strong>{currentScreen}</strong></div>
          <div>Historial: {navigationHistory.join(' → ')}</div>
          <div>Elección: {currentElection?.nombre || 'Ninguna'}</div>
          <div>Cargo: {currentPosition?.catalogo?.nombre || 'Ninguno'}</div>
        </div>
      )}
      {renderCurrentScreen()}
    </div>
  );
}
