const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...');
    console.log('📋 Se mantendrá la tabla CatalogoCargo intacta');
    
    // Deshabilitar verificación de foreign keys
    console.log('🔓 Deshabilitando verificación de foreign keys...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
    
    // Eliminar datos en orden correcto
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
    
    // Reiniciar auto_increment
    console.log('🔄 Reiniciando auto_increment...');
    await prisma.$executeRawUnsafe('ALTER TABLE Eleccion AUTO_INCREMENT = 1');
    await prisma.$executeRawUnsafe('ALTER TABLE Cargo AUTO_INCREMENT = 1');
    await prisma.$executeRawUnsafe('ALTER TABLE Candidato AUTO_INCREMENT = 1');
    await prisma.$executeRawUnsafe('ALTER TABLE Ronda AUTO_INCREMENT = 1');
    await prisma.$executeRawUnsafe('ALTER TABLE Resultado AUTO_INCREMENT = 1');
    await prisma.$executeRawUnsafe('ALTER TABLE PublicacionResultado AUTO_INCREMENT = 1');
    
    // Rehabilitar verificación de foreign keys
    console.log('🔒 Rehabilitando verificación de foreign keys...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🎉 Limpieza completada exitosamente!');
    
    // Mostrar estado final
    const catalogosCount = await prisma.catalogoCargo.count();
    console.log(`✅ CatalogoCargo mantenido: ${catalogosCount} registros`);
    
    // Mostrar conteos de todas las tablas
    const counts = await Promise.all([
      prisma.eleccion.count(),
      prisma.cargo.count(),
      prisma.candidato.count(),
      prisma.ronda.count(),
      prisma.resultado.count(),
      prisma.publicacionResultado.count(),
      prisma.catalogoCargo.count()
    ]);
    
    console.log('\n📊 Estado final de las tablas:');
    console.log(`   Eleccion: ${counts[0]} registros`);
    console.log(`   Cargo: ${counts[1]} registros`);
    console.log(`   Candidato: ${counts[2]} registros`);
    console.log(`   Ronda: ${counts[3]} registros`);
    console.log(`   Resultado: ${counts[4]} registros`);
    console.log(`   PublicacionResultado: ${counts[5]} registros`);
    console.log(`   CatalogoCargo: ${counts[6]} registros`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
cleanupDatabase()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });
