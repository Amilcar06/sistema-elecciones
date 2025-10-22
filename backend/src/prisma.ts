import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Configuración de pool de conexiones para mejor manejo de concurrencia
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Configurar pool de conexiones y manejo de errores
prisma.$connect().catch((error) => {
  console.error('❌ Error conectando a la base de datos:', error);
  process.exit(1);
});

// Manejar desconexión graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;