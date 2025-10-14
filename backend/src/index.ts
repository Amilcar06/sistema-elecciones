import express from "express";
import cors from "cors";

import eleccionesRouter from "./routes/elecciones";
import cargosRouter from "./routes/cargos";
import candidatosRouter from "./routes/candidatos";
import rondasRouter from "./routes/rondas";
import resultadosRouter from "./routes/resultados";
import catalogoCargoRouter from "./routes/catalogoCargo";
import publicacionesRouter from "./routes/publicaciones";
import authRouter from "./routes/auth";
import dashboardRouter from "./routes/dashboard";

import { helmetConfig, apiRateLimit, getRealIP } from "./middleware/security";

const app = express();

// Middleware de seguridad
app.use(helmetConfig);
app.use(getRealIP);
app.use(apiRateLimit);
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get("/api/health", (req, res) => res.send("Backend funcionando"));

// Rutas públicas (sin autenticación)
app.use("/api/auth", authRouter);

// Rutas protegidas (requieren autenticación)
app.use("/api/elecciones", eleccionesRouter);
app.use("/api/cargos", cargosRouter);
app.use("/api/candidatos", candidatosRouter);
app.use("/api/rondas", rondasRouter);
app.use("/api/resultados", resultadosRouter);
app.use("/api/catalogo-cargos", catalogoCargoRouter);
app.use("/api/publicaciones", publicacionesRouter);
app.use("/api/dashboard", dashboardRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
