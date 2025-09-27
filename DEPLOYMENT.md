# 🚀 Guía de Deployment - Sistema de Elecciones

## Stack de Deployment
- **Frontend**: Netlify (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Base de datos**: Render PostgreSQL

## 📋 Pasos de Deployment

### 1. Crear PostgreSQL en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en "New" → "PostgreSQL"
3. Configuración:
   - **Name**: `elecciones-postgres`
   - **Database**: `elecciones_academicas`
   - **User**: `elecciones_user`
   - **Region**: Oregon (US West)
   - **Plan**: Free
4. Click "Create Database"
5. **Guarda la Connection String** (la necesitarás después)

### 2. Deploy Backend en Render

1. En Render Dashboard, click "New" → "Web Service"
2. Conecta tu repositorio GitHub
3. Configuración:
   - **Name**: `elecciones-backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Variables de entorno:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (tu connection string de PostgreSQL)
5. Click "Create Web Service"

### 3. Deploy Frontend en Netlify

1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Conecta tu repositorio GitHub
4. Configuración:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Variables de entorno:
   - `VITE_API_URL`: `https://tu-backend-render.onrender.com/api`
6. Click "Deploy site"

### 4. Migrar Datos Existentes

Si tienes datos en MySQL local que quieres migrar:

```bash
# En tu directorio backend
npm install
npm run migrate:to-postgres
```

## 🔧 Configuración Post-Deployment

### Variables de Entorno Requeridas

**Backend (Render)**:
```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
```

**Frontend (Netlify)**:
```
VITE_API_URL=https://tu-backend-render.onrender.com/api
```

### URLs de Ejemplo

- **Backend**: `https://elecciones-backend.onrender.com`
- **Frontend**: `https://tu-sitio.netlify.app`
- **API Health Check**: `https://elecciones-backend.onrender.com/api/health`

## 🚨 Troubleshooting

### Backend no inicia
- Verifica que `DATABASE_URL` esté correctamente configurada
- Revisa los logs en Render Dashboard
- Asegúrate de que las migraciones se ejecuten correctamente

### Frontend no conecta con Backend
- Verifica que `VITE_API_URL` apunte al backend correcto
- Revisa CORS en el backend
- Confirma que el backend esté funcionando

### Base de datos
- Render PostgreSQL puede tardar en estar disponible
- Verifica la connection string
- Revisa los logs de migración

## 📊 Monitoreo

### Health Checks
- Backend: `GET /api/health`
- Frontend: Verifica que cargue correctamente

### Logs
- **Render**: Dashboard → Tu servicio → Logs
- **Netlify**: Dashboard → Tu sitio → Functions → Logs

## 💡 Tips

1. **Sleep Mode**: Render puede dormir el backend después de 15 min de inactividad. La primera request puede tardar ~30 segundos.

2. **Build Times**: 
   - Backend: ~2-3 minutos
   - Frontend: ~1-2 minutos

3. **Auto-Deploy**: Ambos servicios se actualizan automáticamente cuando haces push a GitHub.

4. **Custom Domain**: Puedes agregar un dominio personalizado en ambos servicios.

## 🔄 Actualizaciones

Para actualizar el sistema:

1. Haz cambios en tu código local
2. Commit y push a GitHub
3. Netlify y Render detectarán los cambios automáticamente
4. Monitorea los logs para verificar que todo funcione

## 📞 Soporte

- **Render**: [Documentación](https://render.com/docs)
- **Netlify**: [Documentación](https://docs.netlify.com)
- **Prisma**: [Documentación](https://www.prisma.io/docs)
