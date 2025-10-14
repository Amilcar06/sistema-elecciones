import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de autenticación...');

  // Usuario Administrador
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

  // Crear usuario estándar de ejemplo
  const usuarioPassword = await bcrypt.hash('usuario123', 12);
  
  const usuario = await prisma.usuario.upsert({
    where: { email: 'usuario@sistema-electoral.com' },
    update: {},
    create: {
      email: 'usuario@sistema-electoral.com',
      nombre: 'Juan',
      apellido: 'Usuario',
      password_hash: usuarioPassword,
      rol: 'USUARIO',
      estado: 'ACTIVO'
    }
  });

  console.log('Usuario estándar creado:', usuario.email);

  // Crear otro usuario de ejemplo
  const usuario2Password = await bcrypt.hash('usuario123', 12);
  
  const usuario2 = await prisma.usuario.upsert({
    where: { email: 'maria@sistema-electoral.com' },
    update: {},
    create: {
      email: 'maria@sistema-electoral.com',
      nombre: 'María',
      apellido: 'García',
      password_hash: usuario2Password,
      rol: 'USUARIO',
      estado: 'ACTIVO'
    }
  });

  console.log('Segundo usuario creado:', usuario2.email);

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
  console.log('Usuario 1: usuario@sistema-electoral.com / usuario123');
  console.log('Usuario 2: maria@sistema-electoral.com / usuario123');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
