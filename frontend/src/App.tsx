import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { LazyRouteWrapper } from "./components/LazyRouteWrapper";
import { usePreloadRoutes } from "./hooks/usePreloadRoutes";

// Importar rutas (ahora con lazy loading)
import { HomeRoute } from "./routes/HomeRoute";
import { PositionsRoute } from "./routes/PositionsRoute";
import { CandidatesRoute } from "./routes/CandidatesRoute";
import { ResultsRoute } from "./routes/ResultsRoute";
import { AdminResultsRoute } from "./routes/AdminResultsRoute";
import { SummaryRoute } from "./routes/SummaryRoute";
import { HistoryRoute } from "./routes/HistoryRoute";
import { PublicResultsRoute } from "./routes/PublicResultsRoute";

// Componente interno que usa el hook
const AppRoutes: React.FC = () => {
  usePreloadRoutes(); // Precargar rutas inteligentemente
  
  return (
    <div className="min-h-screen bg-background">
          <Routes>
            {/* Rutas principales con lazy loading */}
            <Route path="/" element={
              <LazyRouteWrapper>
                <HomeRoute />
              </LazyRouteWrapper>
            } />
            <Route path="/positions" element={
              <LazyRouteWrapper>
                <PositionsRoute />
              </LazyRouteWrapper>
            } />
            <Route path="/candidates" element={
              <LazyRouteWrapper>
                <CandidatesRoute />
              </LazyRouteWrapper>
            } />
            <Route path="/results" element={
              <LazyRouteWrapper>
                <ResultsRoute />
              </LazyRouteWrapper>
            } />
            <Route path="/admin-results" element={
              <LazyRouteWrapper>
                <AdminResultsRoute />
              </LazyRouteWrapper>
            } />
            <Route path="/summary" element={
              <LazyRouteWrapper>
                <SummaryRoute />
              </LazyRouteWrapper>
            } />
            <Route path="/history" element={
              <LazyRouteWrapper>
                <HistoryRoute />
              </LazyRouteWrapper>
            } />
            
            {/* Ruta pública con lazy loading */}
            <Route path="/realtime/:electionId" element={
              <LazyRouteWrapper>
                <PublicResultsRoute />
              </LazyRouteWrapper>
            } />
            
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
