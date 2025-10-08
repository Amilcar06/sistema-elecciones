import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de autenticación...');

  // Crear usuario administrador por defecto
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@sistema-electoral.com' },
    update: {},
    create: {
      email: 'admin@sistema-electoral.com',
      nombre: 'Administrador',
      apellido: 'Sistema',
      password_hash: adminPassword,
      rol: 'ADMIN',
      estado: 'ACTIVO'
    }
  });

  console.log('Usuario administrador creado:', admin.email);

  // Crear usuario organizador de ejemplo
  const organizadorPassword = await bcrypt.hash('organizador123', 12);
  
  const organizador = await prisma.usuario.upsert({
    where: { email: 'organizador@sistema-electoral.com' },
    update: {},
    create: {
      email: 'organizador@sistema-electoral.com',
      nombre: 'Juan',
      apellido: 'Organizador',
      password_hash: organizadorPassword,
      rol: 'ORGANIZADOR',
      estado: 'ACTIVO'
    }
  });

  console.log('Usuario organizador creado:', organizador.email);

  // Crear usuario observador de ejemplo
  const observadorPassword = await bcrypt.hash('observador123', 12);
  
  const observador = await prisma.usuario.upsert({
    where: { email: 'observador@sistema-electoral.com' },
    update: {},
    create: {
      email: 'observador@sistema-electoral.com',
      nombre: 'María',
      apellido: 'Observadora',
      password_hash: observadorPassword,
      rol: 'OBSERVADOR',
      estado: 'ACTIVO'
    }
  });

  console.log('Usuario observador creado:', observador.email);

  // Crear algunos cargos del catálogo
  const cargosCatalogo = [
    { nombre: 'Presidente', descripcion: 'Cargo ejecutivo principal' },
    { nombre: 'Vicepresidente', descripcion: 'Cargo ejecutivo secundario' },
    { nombre: 'Secretario', descripcion: 'Cargo administrativo' },
    { nombre: 'Tesorero', descripcion: 'Cargo financiero' },
    { nombre: 'Vocal', descripcion: 'Miembro del consejo' },
    { nombre: 'Alcalde', descripcion: 'Autoridad municipal' },
    { nombre: 'Concejal', descripcion: 'Miembro del concejo municipal' },
    { nombre: 'Gobernador', descripcion: 'Autoridad departamental' },
    { nombre: 'Diputado', descripcion: 'Representante legislativo' },
    { nombre: 'Senador', descripcion: 'Representante del senado' }
  ];

  for (const cargo of cargosCatalogo) {
    await prisma.catalogoCargo.upsert({
      where: { nombre: cargo.nombre },
      update: {},
      create: cargo
    });
  }

  console.log('Catálogo de cargos creado');

  // Crear una elección de ejemplo
  const eleccionEjemplo = await prisma.eleccion.upsert({
    where: { id_eleccion: 1 },
    update: {},
    create: {
      nombre: 'Elección de Ejemplo 2025',
      descripcion: 'Elección de demostración del sistema',
      fecha: new Date('2025-12-31'),
      estado: 'DRAFT',
      id_usuario_creador: admin.id_usuario
    }
  });

  console.log('Elección de ejemplo creada:', eleccionEjemplo.nombre);

  console.log('Seed de autenticación completado exitosamente!');
  console.log('Credenciales de prueba:');
  console.log('Admin: admin@sistema-electoral.com / admin123');
  console.log('Organizador: organizador@sistema-electoral.com / organizador123');
  console.log('Observador: observador@sistema-electoral.com / observador123');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
