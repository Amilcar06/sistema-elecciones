import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

const prisma = new PrismaClient();

// Configuración para tu MySQL local (ajusta según tu configuración)
const mysqlConfig = {
  host: 'localhost',
  port: 3306,
  user: 'elecciones_user',
  password: 'elecciones_password',
  database: 'elecciones_academicas'
};

async function migrateToPostgreSQL() {
  console.log('🚀 Iniciando migración de MySQL a PostgreSQL...');
  
  try {
    // Conectar a MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conectado a MySQL');

    // 1. Migrar CatalogoCargo
    console.log('📋 Migrando CatalogoCargo...');
    const [catalogoCargos] = await mysqlConnection.execute(
      'SELECT * FROM CatalogoCargo'
    );
    
    for (const cargo of catalogoCargos as any[]) {
      await prisma.catalogoCargo.upsert({
        where: { id_catalogo: cargo.id_catalogo },
        update: {
          nombre: cargo.nombre,
          descripcion: cargo.descripcion,
          created_at: cargo.created_at,
          updated_at: cargo.updated_at
        },
        create: {
          id_catalogo: cargo.id_catalogo,
          nombre: cargo.nombre,
          descripcion: cargo.descripcion,
          created_at: cargo.created_at,
          updated_at: cargo.updated_at
        }
      });
    }
    console.log(`✅ Migrados ${catalogoCargos.length} CatalogoCargo`);

    // 2. Migrar Eleccion
    console.log('🗳️ Migrando Eleccion...');
    const [elecciones] = await mysqlConnection.execute(
      'SELECT * FROM Eleccion'
    );
    
    for (const eleccion of elecciones as any[]) {
      await prisma.eleccion.upsert({
        where: { id_eleccion: eleccion.id_eleccion },
        update: {
          nombre: eleccion.nombre,
          fecha: eleccion.fecha,
          estado: eleccion.estado,
          descripcion: eleccion.descripcion,
          created_at: eleccion.created_at,
          updated_at: eleccion.updated_at
        },
        create: {
          id_eleccion: eleccion.id_eleccion,
          nombre: eleccion.nombre,
          fecha: eleccion.fecha,
          estado: eleccion.estado,
          descripcion: eleccion.descripcion,
          created_at: eleccion.created_at,
          updated_at: eleccion.updated_at
        }
      });
    }
    console.log(`✅ Migrados ${elecciones.length} Eleccion`);

    // 3. Migrar Cargo
    console.log('👔 Migrando Cargo...');
    const [cargos] = await mysqlConnection.execute(
      'SELECT * FROM Cargo'
    );
    
    for (const cargo of cargos as any[]) {
      await prisma.cargo.upsert({
        where: { id_cargo: cargo.id_cargo },
        update: {
          id_eleccion: cargo.id_eleccion,
          id_catalogo: cargo.id_catalogo,
          estado: cargo.estado,
          orden: cargo.orden,
          created_at: cargo.created_at,
          updated_at: cargo.updated_at
        },
        create: {
          id_cargo: cargo.id_cargo,
          id_eleccion: cargo.id_eleccion,
          id_catalogo: cargo.id_catalogo,
          estado: cargo.estado,
          orden: cargo.orden,
          created_at: cargo.created_at,
          updated_at: cargo.updated_at
        }
      });
    }
    console.log(`✅ Migrados ${cargos.length} Cargo`);

    // 4. Migrar Candidato
    console.log('👤 Migrando Candidato...');
    const [candidatos] = await mysqlConnection.execute(
      'SELECT * FROM Candidato'
    );
    
    for (const candidato of candidatos as any[]) {
      await prisma.candidato.upsert({
        where: { id_candidato: candidato.id_candidato },
        update: {
          id_cargo: candidato.id_cargo,
          nombre_completo: candidato.nombre_completo,
          activo: candidato.activo,
          created_at: candidato.created_at,
          updated_at: candidato.updated_at
        },
        create: {
          id_candidato: candidato.id_candidato,
          id_cargo: candidato.id_cargo,
          nombre_completo: candidato.nombre_completo,
          activo: candidato.activo,
          created_at: candidato.created_at,
          updated_at: candidato.updated_at
        }
      });
    }
    console.log(`✅ Migrados ${candidatos.length} Candidato`);

    // 5. Migrar Ronda
    console.log('🔄 Migrando Ronda...');
    const [rondas] = await mysqlConnection.execute(
      'SELECT * FROM Ronda'
    );
    
    for (const ronda of rondas as any[]) {
      await prisma.ronda.upsert({
        where: { id_ronda: ronda.id_ronda },
        update: {
          id_cargo: ronda.id_cargo,
          numero_ronda: ronda.numero_ronda,
          fecha_registro: ronda.fecha_registro,
          finalizada: ronda.finalizada,
          observaciones: ronda.observaciones
        },
        create: {
          id_ronda: ronda.id_ronda,
          id_cargo: ronda.id_cargo,
          numero_ronda: ronda.numero_ronda,
          fecha_registro: ronda.fecha_registro,
          finalizada: ronda.finalizada,
          observaciones: ronda.observaciones
        }
      });
    }
    console.log(`✅ Migrados ${rondas.length} Ronda`);

    // 6. Migrar Resultado
    console.log('📊 Migrando Resultado...');
    const [resultados] = await mysqlConnection.execute(
      'SELECT * FROM Resultado'
    );
    
    for (const resultado of resultados as any[]) {
      await prisma.resultado.upsert({
        where: { 
          id_ronda_id_candidato: {
            id_ronda: resultado.id_ronda,
            id_candidato: resultado.id_candidato
          }
        },
        update: {
          votos: resultado.votos,
          registrado_por: resultado.registrado_por,
          created_at: resultado.created_at,
          updated_at: resultado.updated_at
        },
        create: {
          id_resultado: resultado.id_resultado,
          id_ronda: resultado.id_ronda,
          id_candidato: resultado.id_candidato,
          votos: resultado.votos,
          registrado_por: resultado.registrado_por,
          created_at: resultado.created_at,
          updated_at: resultado.updated_at
        }
      });
    }
    console.log(`✅ Migrados ${resultados.length} Resultado`);

    // 7. Migrar PublicacionResultado
    console.log('📢 Migrando PublicacionResultado...');
    const [publicaciones] = await mysqlConnection.execute(
      'SELECT * FROM PublicacionResultado'
    );
    
    for (const publicacion of publicaciones as any[]) {
      await prisma.publicacionResultado.upsert({
        where: { id_publicacion: publicacion.id_publicacion },
        update: {
          id_eleccion: publicacion.id_eleccion,
          publicado_por: publicacion.publicado_por,
          fecha_publicacion: publicacion.fecha_publicacion,
          modo: publicacion.modo,
          nota: publicacion.nota
        },
        create: {
          id_publicacion: publicacion.id_publicacion,
          id_eleccion: publicacion.id_eleccion,
          publicado_por: publicacion.publicado_por,
          fecha_publicacion: publicacion.fecha_publicacion,
          modo: publicacion.modo,
          nota: publicacion.nota
        }
      });
    }
    console.log(`✅ Migrados ${publicaciones.length} PublicacionResultado`);

    await mysqlConnection.end();
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToPostgreSQL()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default migrateToPostgreSQL;
