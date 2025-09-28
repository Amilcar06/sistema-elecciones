import express from "express";
import cors from "cors";

import eleccionesRouter from "./routes/elecciones";
import cargosRouter from "./routes/cargos";
import candidatosRouter from "./routes/candidatos";
import rondasRouter from "./routes/rondas";
import resultadosRouter from "./routes/resultados";
import catalogoCargoRouter from "./routes/catalogoCargo";
import publicacionesRouter from "./routes/publicaciones";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.send("Backend funcionando"));

// Prefijo /api en todas las rutas
app.use("/api/elecciones", eleccionesRouter);
app.use("/api/cargos", cargosRouter);
app.use("/api/candidatos", candidatosRouter);
app.use("/api/rondas", rondasRouter);
app.use("/api/resultados", resultadosRouter);
app.use("/api/catalogo-cargos", catalogoCargoRouter);
app.use("/api/publicaciones", publicacionesRouter);

const PORT = 3001;
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
