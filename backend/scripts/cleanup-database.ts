import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...');
    console.log('📋 Se mantendrá la tabla CatalogoCargo intacta');
    
    // Orden de eliminación respetando las foreign keys
    console.log('🗑️  Eliminando PublicacionResultado...');
    await prisma.publicacionResultado.deleteMany({});
    
    console.log('🗑️  Eliminando Resultado...');
    await prisma.resultado.deleteMany({});
    
    console.log('🗑️  Eliminando Ronda...');
    await prisma.ronda.deleteMany({});
    
    console.log('🗑️  Eliminando Candidato...');
    await prisma.candidato.deleteMany({});
    
    console.log('🗑️  Eliminando Cargo...');
    await prisma.cargo.deleteMany({});
    
    console.log('🗑️  Eliminando Eleccion...');
    await prisma.eleccion.deleteMany({});
    
    // Verificar que CatalogoCargo se mantiene
    const catalogosCount = await prisma.catalogoCargo.count();
    console.log(`✅ CatalogoCargo mantenido: ${catalogosCount} registros`);
    
    console.log('🎉 Limpieza completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

export { cleanupDatabase };
