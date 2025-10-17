import prisma from '../prisma';

export async function cleanupSessions() {
  try {
    const result = await prisma.sesion.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { last_activity: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          { absolute_expiry: { lt: new Date() } }
        ]
      }
    });

    console.log(`🧹 Limpieza de sesiones: ${result.count} sesiones eliminadas`);
    return result.count;
  } catch (error) {
    console.error('❌ Error en limpieza de sesiones:', error);
    throw error;
  }
}