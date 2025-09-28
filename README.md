# 🗳️ Sistema de Gestión de Elecciones

Sistema completo de gestión de elecciones desarrollado con **React**, **Express.js** y **PostgreSQL**. Incluye funcionalidades para crear elecciones, gestionar candidatos, registrar votos y publicar resultados.

## 🚀 Características Principales

- ✅ **Backend API REST** con Express.js y TypeScript
- ✅ **Frontend React** con TypeScript y shadcn/ui
- ✅ **Base de datos PostgreSQL** con Prisma ORM
- ✅ **Sistema de rondas** para elecciones por etapas
- ✅ **Gestión completa de candidatos** y cargos
- ✅ **Publicación de resultados** en tiempo real
- ✅ **Interfaz moderna** y responsive
- ✅ **Docker Compose** para desarrollo
- ✅ **Documentación completa** y pruebas

## 🏗️ Arquitectura del Sistema

```
sistema-elecciones/
├── backend/                 # API REST con Express.js
│   ├── src/
│   │   ├── routes/         # Endpoints de la API
│   │   ├── index.ts        # Servidor principal
│   │   └── prisma.ts       # Cliente de Prisma
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de base de datos
│   │   ├── seed.ts         # Datos iniciales
│   │   └── migrations/     # Migraciones de BD
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios API
│   │   └── styles/         # Estilos CSS
│   └── package.json
└── docker-compose.yml      # Configuración Docker
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **CORS**

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **shadcn/ui**
- **Tailwind CSS**

### Base de Datos
- **PostgreSQL 15**
- **Prisma Migrations**

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v15 o superior)
- npm o yarn
- Git

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/sistema-elecciones.git
cd sistema-elecciones
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL

# Ejecutar migraciones
npx prisma migrate dev

# Poblar base de datos
npm run prisma:seed

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install

# Iniciar aplicación
npm run dev
```

### 4. Usar Docker (Opcional)
```bash
# Iniciar PostgreSQL con Docker
docker-compose up postgres

# O iniciar todo el stack
docker-compose up
```

## 🗄️ Estructura de la Base de Datos

### Entidades Principales
- **Eleccion**: Información de las elecciones
- **Cargo**: Cargos a elegir en cada elección
- **Candidato**: Candidatos por cargo
- **Ronda**: Rondas de votación
- **Resultado**: Votos por candidato en cada ronda
- **PublicacionResultado**: Registro de publicaciones

### Relaciones
- Una elección tiene múltiples cargos
- Un cargo tiene múltiples candidatos
- Un cargo puede tener múltiples rondas
- Una ronda tiene múltiples resultados
- Los resultados se publican en PublicacionResultado

## 🔌 API Endpoints

### Elecciones
- `GET /api/elecciones` - Listar elecciones
- `POST /api/elecciones` - Crear elección
- `GET /api/elecciones/:id` - Obtener elección
- `PUT /api/elecciones/:id` - Actualizar elección
- `DELETE /api/elecciones/:id` - Eliminar elección
- `PATCH /api/elecciones/:id/estado` - Cambiar estado

### Candidatos
- `GET /api/candidatos` - Listar candidatos
- `POST /api/candidatos` - Crear candidato
- `GET /api/candidatos/:id` - Obtener candidato
- `PUT /api/candidatos/:id` - Actualizar candidato
- `DELETE /api/candidatos/:id` - Eliminar candidato

### Resultados
- `GET /api/resultados/rondas/:id` - Resultados por ronda
- `POST /api/resultados/rondas/:id` - Registrar votos
- `GET /api/resultados/rondas/:id/ganador` - Obtener ganador
- `GET /api/resultados/rondas/:id/empate` - Verificar empate

## 🧪 Pruebas

### Probar API con curl
```bash
# Listar elecciones
curl http://localhost:3001/api/elecciones

# Crear elección
curl -X POST http://localhost:3001/api/elecciones \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Elección 2024", "fecha": "2024-12-20"}'
```

### Script de pruebas automatizadas
```bash
chmod +x test-routes-comparison.sh
./test-routes-comparison.sh
```

## 📊 Funcionalidades del Sistema

### 1. Gestión de Elecciones
- Crear y configurar elecciones
- Definir fechas y estados
- Gestionar cargos por elección

### 2. Gestión de Candidatos
- Registrar candidatos por cargo
- Activar/desactivar candidatos
- Validaciones de unicidad

### 3. Sistema de Votación
- Crear rondas de votación
- Registrar votos por candidato
- Calcular ganadores y empates

### 4. Publicación de Resultados
- Publicar resultados en tiempo real
- Múltiples formatos (proyector, PDF, Excel)
- Historial de publicaciones

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```env
# Backend (.env)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/elecciones_academicas?schema=public"
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL="http://localhost:3001/api"
```

### Scripts Disponibles
```bash
# Backend
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run prisma:seed  # Poblar BD

# Frontend
npm run dev          # Desarrollo con Vite
npm run build        # Build para producción
npm run preview      # Preview del build
```

## 📈 Estado del Proyecto

### ✅ Completado
- [x] Backend API REST completo
- [x] Frontend React con TypeScript
- [x] Base de datos PostgreSQL
- [x] Migración de MySQL a PostgreSQL
- [x] Todas las routes probadas
- [x] Services del frontend compatibles
- [x] Documentación completa
- [x] Docker Compose configurado

### 🔄 En Desarrollo
- [ ] Tests automatizados
- [ ] Optimización de performance
- [ ] Mejoras en UI/UX

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Amilcar Yujra**
- GitHub: [@Amilcar06](https://github.com/Amilcar06)
- Email: amilcaryujra23@gmail.com

## 🙏 Agradecimientos

- shadcn/ui por los componentes de UI
- Prisma por el ORM
- React y Express.js por los frameworks
- PostgreSQL por la base de datos

---

**🎉 ¡Sistema de elecciones completamente funcional y listo para usar!**