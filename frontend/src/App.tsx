import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LazyRouteWrapper } from "./components/LazyRouteWrapper";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginForm } from "./components/LoginForm";
import { UnauthorizedPage } from "./components/UnauthorizedPage";
import { Dashboard } from "./components/Dashboard";
import { Navigation } from "./components/Navigation";
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
      <Navigation />
      <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Ruta pública de resultados */}
            <Route path="/realtime/:electionId" element={
              <LazyRouteWrapper>
                <PublicResultsRoute />
              </LazyRouteWrapper>
            } />
            
            {/* Rutas protegidas - Requieren autenticación */}
            <Route path="/" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <HomeRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/positions" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <PositionsRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/candidates" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <CandidatesRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <ResultsRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/admin-results" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <AdminResultsRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/summary" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <SummaryRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <LazyRouteWrapper>
                  <HistoryRoute />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            
            {/* Dashboard - Solo para organizadores y admins */}
            <Route path="/dashboard" element={
              <ProtectedRoute organizadorOnly>
                <LazyRouteWrapper>
                  <Dashboard />
                </LazyRouteWrapper>
              </ProtectedRoute>
            } />
            
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
