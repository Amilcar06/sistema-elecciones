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

// Render usa un proxy inverso → hay que confiar en él
app.set("trust proxy", 1);

// Orígenes permitidos
const allowedOrigins = [
  process.env.FRONTEND_URL, // se recomienda configurarla en Render
  "https://sistema-eleccion.netlify.app",
  "http://localhost:5173",
].filter(Boolean);

// Middleware de CORS robusto
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Bloqueado por CORS: ${origin}`);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Manejo manual del preflight (opcional pero recomendado en Render)
app.options("*", cors());

// Middlewares de seguridad
app.use(helmetConfig);
app.use(getRealIP);
app.use(apiRateLimit);
app.use(express.json({ limit: "10mb" }));

// Log para depurar CORS (puedes quitarlo luego)
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => res.send("Backend funcionando"));

// Rutas públicas
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

// Servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`✅ Orígenes permitidos: ${allowedOrigins.join(", ")}`);
});
