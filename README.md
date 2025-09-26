# 🗳️ Sistema de Elecciones Académicas

Sistema completo de gestión de elecciones estudiantiles con backend en Node.js/Express y frontend en React/Vite.

## 📋 Características

- ✅ **Gestión Completa de Elecciones**: Crear, configurar y administrar elecciones
- ✅ **Múltiples Cargos**: Soporte para diferentes tipos de cargos académicos
- ✅ **Registro de Candidatos**: Sistema de registro y gestión de candidatos
- ✅ **Votación por Rondas**: Soporte para primera y segunda ronda en caso de empates
- ✅ **Resultados en Tiempo Real**: Visualización de resultados con animaciones
- ✅ **Pantalla Pública**: Modo proyector para mostrar resultados públicamente
- ✅ **Historial Completo**: Consulta de elecciones anteriores
- ✅ **Reportes**: Generación de reportes en PDF y Excel
- ✅ **Estados de Elección**: Control de flujo (DRAFT → EN_CURSO → FINALIZADA)

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + Vite  │◄──►│   Node.js +     │◄──►│   MySQL +       │
│   TypeScript    │    │   Express +     │    │   Prisma ORM    │
│   Tailwind CSS  │    │   TypeScript    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/sistema-elecciones.git
cd sistema-elecciones
```

### 2. Configurar Base de Datos

1. Crear una base de datos MySQL:
```sql
CREATE DATABASE elecciones_academicas;
```

2. Configurar variables de entorno en `backend/.env`:
```env
DATABASE_URL="mysql://usuario:password@localhost:3306/elecciones_academicas"
PORT=3001
```

### 3. Instalar Dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 4. Configurar Base de Datos

```bash
# Desde la carpeta backend
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Ejecutar el Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

El sistema estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## 📁 Estructura del Proyecto

```
sistema-elecciones/
├── backend/                 # Backend Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── prisma.ts       # Cliente de Prisma
│   │   └── index.ts        # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de la base de datos
│   │   └── migrations/     # Migraciones de la BD
│   ├── scripts/            # Scripts de utilidad
│   └── package.json
├── frontend/               # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios de API
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Punto de entrada
│   ├── public/             # Archivos estáticos
│   └── package.json
├── docs/                   # Documentación
├── .gitignore
└── README.md
```

## 🔄 Flujo de Estados de Elección

```
DRAFT → EN_CURSO → FINALIZADA
  ↓         ↓          ↓
Crear    Iniciar    Resumen
Elección Primera    Final
         Ronda
```

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run start        # Producción
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar datos iniciales
npm run db:reset     # Resetear base de datos
```

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run preview      # Vista previa de producción
npm run lint         # Linter
```

## 📊 API Endpoints

### Elecciones
- `GET /api/elecciones` - Listar elecciones
- `POST /api/elecciones` - Crear elección
- `GET /api/elecciones/:id` - Obtener elección
- `PUT /api/elecciones/:id` - Actualizar elección
- `PATCH /api/elecciones/:id/estado` - Cambiar estado
- `GET /api/elecciones/:id/resultados-publicos` - Resultados públicos
- `GET /api/elecciones/:id/resumen-final` - Resumen final

### Cargos
- `GET /api/cargos` - Listar cargos
- `POST /api/cargos` - Crear cargo
- `GET /api/cargos/:id` - Obtener cargo
- `PUT /api/cargos/:id` - Actualizar cargo
- `DELETE /api/cargos/:id` - Eliminar cargo

### Candidatos
- `GET /api/candidatos` - Listar candidatos
- `POST /api/candidatos` - Crear candidato
- `GET /api/candidatos/:id` - Obtener candidato
- `PUT /api/candidatos/:id` - Actualizar candidato
- `DELETE /api/candidatos/:id` - Eliminar candidato

### Rondas y Resultados
- `GET /api/rondas/cargos/:id` - Listar rondas
- `POST /api/rondas/cargos/:id` - Crear ronda
- `GET /api/resultados/rondas/:id` - Listar resultados
- `POST /api/resultados/rondas/:id` - Crear resultados

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚀 Despliegue

### Desarrollo
```bash
# Usar docker-compose para desarrollo
docker-compose up -d
```

### Producción
1. Configurar variables de entorno de producción
2. Construir el frontend: `npm run build`
3. Construir el backend: `npm run build`
4. Desplegar en servidor

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Amilcar Josias Yujra Chipana** - *Desarrollo inicial* - [tu-github](https://github.com/Amilcar06)

## 🙏 Agradecimientos

- React y Vite por el framework frontend
- Node.js y Express por el backend
- Prisma por el ORM
- Tailwind CSS por el diseño
- Lucide React por los iconos

---

⭐ **¡No olvides darle una estrella al proyecto si te resulta útil!**
