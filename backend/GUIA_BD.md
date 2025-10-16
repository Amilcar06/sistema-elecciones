# Guía rápida para levantar el backend de Sistema Elecciones

Sigue estos pasos para tener tu backend funcionando localmente.

---

## 1. Clona el repositorio y entra al folder del backend

```sh
git clone <URL_DEL_REPO>
cd sistema-elecciones-main\ 2/backend
```

---

## 2. Instala las dependencias

```sh
npm install
```

---

## 3. Configura el archivo `.env`

Copia el archivo de ejemplo y edítalo con tus datos locales:

```sh
cp env.example .env
```

Edita `.env` y asegúrate de tener la URL de tu base de datos local, por ejemplo:

```
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_elecciones"
JWT_SECRET="tu-jwt-super-secreto"
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

---

## 4. Crea la base de datos en PostgreSQL

Abre tu terminal de PostgreSQL y ejecuta:

```sql
CREATE DATABASE sistema_elecciones;
```

---

## 5. Ejecuta las migraciones de Prisma

Esto creará las tablas necesarias según el esquema:

```sh
npx prisma migrate dev --name init
```

Si ya tienes migraciones, solo ejecuta:

```sh
npx prisma migrate dev
```

---

## 6. (Opcional) Aplica el seed para datos iniciales

Si tienes un archivo `prisma/seed.ts`, ejecuta:

```sh
npx prisma db seed
```

O si tu proyecto usa un script diferente, revisa el package.json o ejecuta:

```sh
ts-node prisma/seed.ts
```

---

## 7. Inicia el backend en modo desarrollo

```sh
npm run dev
```

El backend debería iniciar en `http://localhost:3001` (o el puerto que configuraste).

---

## 8. Verifica el estado

Abre en tu navegador:

```
http://localhost:3001/api/health
```

Deberías ver:  
`Backend funcionando 🚀`

---

## 9. Notas útiles

- Si cambias el `.env`, **reinicia** el backend.
- Si tienes problemas de conexión, revisa la URL de la base de datos y que el servicio de PostgreSQL esté corriendo.
- Para producción, usa las variables de entorno adecuadas y revisa la seguridad del JWT y CORS.

---

¡Listo! Tu backend debería estar funcionando y listo para conectarse con el frontend.