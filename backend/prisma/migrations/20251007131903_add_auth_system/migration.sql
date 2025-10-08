-- CreateEnum
CREATE TYPE "public"."RolUsuario" AS ENUM ('ADMIN', 'ORGANIZADOR', 'OBSERVADOR');

-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- AlterTable
ALTER TABLE "public"."Candidato" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Cargo" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."CatalogoCargo" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Eleccion" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "id_usuario_creador" INTEGER;

-- AlterTable
ALTER TABLE "public"."PublicacionResultado" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Resultado" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Ronda" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "public"."RolUsuario" NOT NULL DEFAULT 'ORGANIZADOR',
    "estado" "public"."EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "ultimo_acceso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."Sesion" (
    "id_sesion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id_sesion")
);

-- CreateTable
CREATE TABLE "public"."Auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "tabla" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "id_registro" INTEGER NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "id_usuario" INTEGER,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_rol" ON "public"."Usuario"("rol");

-- CreateIndex
CREATE INDEX "idx_usuario_estado" ON "public"."Usuario"("estado");

-- CreateIndex
CREATE INDEX "idx_sesion_token" ON "public"."Sesion"("token");

-- CreateIndex
CREATE INDEX "idx_sesion_usuario" ON "public"."Sesion"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_auditoria_tabla_accion" ON "public"."Auditoria"("tabla", "accion");

-- CreateIndex
CREATE INDEX "idx_auditoria_usuario" ON "public"."Auditoria"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_eleccion_usuario_creador" ON "public"."Eleccion"("id_usuario_creador");

-- AddForeignKey
ALTER TABLE "public"."Sesion" ADD CONSTRAINT "Sesion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Auditoria" ADD CONSTRAINT "Auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Eleccion" ADD CONSTRAINT "Eleccion_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "public"."Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
