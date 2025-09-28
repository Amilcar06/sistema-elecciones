import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de CatalogoCargo...')

  const cargos = [
    { nombre: 'Presidente', descripcion: 'Máxima autoridad ejecutiva' },
    { nombre: 'Vicepresidente', descripcion: 'Segundo al mando' },
    { nombre: 'Secretario', descripcion: 'Actas y documentación' },
    { nombre: 'Tesorero', descripcion: 'Finanzas' },
    { nombre: 'Vocal', descripcion: 'Miembro con voz y voto' },
  ]

  for (const cargo of cargos) {
    await prisma.catalogoCargo.upsert({
      where: { nombre: cargo.nombre },
      update: {}, // no actualiza nada si ya existe
      create: cargo,
    })
  }

  console.log('Seed completado')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
