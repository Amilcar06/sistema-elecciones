-- CreateEnum
CREATE TYPE "public"."EstadoEleccion" AS ENUM ('DRAFT', 'EN_CURSO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "public"."EstadoCargo" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "public"."ModoPublicacion" AS ENUM ('PROYECTOR', 'PDF', 'EXCEL');

-- CreateEnum
CREATE TYPE "public"."RolUsuario" AS ENUM ('ADMIN', 'USUARIO', 'ORGANIZADOR', 'OBSERVADOR');

-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "public"."RolUsuario" NOT NULL DEFAULT 'USUARIO',
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
    "refresh_token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "absolute_expiry" TIMESTAMP(3) NOT NULL,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- CreateTable
CREATE TABLE "public"."Eleccion" (
    "id_eleccion" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoEleccion" NOT NULL DEFAULT 'DRAFT',
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "id_usuario_creador" INTEGER,

    CONSTRAINT "Eleccion_pkey" PRIMARY KEY ("id_eleccion")
);

-- CreateTable
CREATE TABLE "public"."CatalogoCargo" (
    "id_catalogo" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "CatalogoCargo_pkey" PRIMARY KEY ("id_catalogo")
);

-- CreateTable
CREATE TABLE "public"."Cargo" (
    "id_cargo" SERIAL NOT NULL,
    "id_eleccion" INTEGER NOT NULL,
    "id_catalogo" INTEGER NOT NULL,
    "estado" "public"."EstadoCargo" NOT NULL DEFAULT 'PENDIENTE',
    "orden" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id_cargo")
);

-- CreateTable
CREATE TABLE "public"."Candidato" (
    "id_candidato" SERIAL NOT NULL,
    "id_cargo" INTEGER NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id_candidato")
);

-- CreateTable
CREATE TABLE "public"."Ronda" (
    "id_ronda" SERIAL NOT NULL,
    "id_cargo" INTEGER NOT NULL,
    "numero_ronda" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Ronda_pkey" PRIMARY KEY ("id_ronda")
);

-- CreateTable
CREATE TABLE "public"."Resultado" (
    "id_resultado" SERIAL NOT NULL,
    "id_ronda" INTEGER NOT NULL,
    "id_candidato" INTEGER NOT NULL,
    "votos" INTEGER NOT NULL DEFAULT 0,
    "registrado_por" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateTable
CREATE TABLE "public"."PublicacionResultado" (
    "id_publicacion" SERIAL NOT NULL,
    "id_eleccion" INTEGER NOT NULL,
    "publicado_por" VARCHAR(50),
    "fecha_publicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modo" "public"."ModoPublicacion" NOT NULL DEFAULT 'PROYECTOR',
    "nota" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "PublicacionResultado_pkey" PRIMARY KEY ("id_publicacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_rol" ON "public"."Usuario"("rol");

-- CreateIndex
CREATE INDEX "idx_usuario_estado" ON "public"."Usuario"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_refresh_token_key" ON "public"."Sesion"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sesion_token" ON "public"."Sesion"("token");

-- CreateIndex
CREATE INDEX "idx_sesion_refresh_token" ON "public"."Sesion"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sesion_usuario" ON "public"."Sesion"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_auditoria_tabla_accion" ON "public"."Auditoria"("tabla", "accion");

-- CreateIndex
CREATE INDEX "idx_auditoria_usuario" ON "public"."Auditoria"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_eleccion_fecha" ON "public"."Eleccion"("fecha");

-- CreateIndex
CREATE INDEX "idx_eleccion_estado" ON "public"."Eleccion"("estado");

-- CreateIndex
CREATE INDEX "idx_eleccion_fecha_estado" ON "public"."Eleccion"("fecha", "estado");

-- CreateIndex
CREATE INDEX "idx_eleccion_usuario_creador" ON "public"."Eleccion"("id_usuario_creador");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoCargo_nombre_key" ON "public"."CatalogoCargo"("nombre");

-- CreateIndex
CREATE INDEX "idx_cargo_eleccion" ON "public"."Cargo"("id_eleccion");

-- CreateIndex
CREATE INDEX "idx_cargo_estado" ON "public"."Cargo"("estado");

-- CreateIndex
CREATE INDEX "idx_cargo_catalogo" ON "public"."Cargo"("id_catalogo");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_id_eleccion_orden_key" ON "public"."Cargo"("id_eleccion", "orden");

-- CreateIndex
CREATE INDEX "idx_candidato_cargo" ON "public"."Candidato"("id_cargo");

-- CreateIndex
CREATE INDEX "idx_candidato_activo" ON "public"."Candidato"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Candidato_id_cargo_nombre_completo_key" ON "public"."Candidato"("id_cargo", "nombre_completo");

-- CreateIndex
CREATE INDEX "idx_ronda_cargo" ON "public"."Ronda"("id_cargo");

-- CreateIndex
CREATE INDEX "idx_ronda_fecha" ON "public"."Ronda"("fecha_registro");

-- CreateIndex
CREATE UNIQUE INDEX "Ronda_id_cargo_numero_ronda_key" ON "public"."Ronda"("id_cargo", "numero_ronda");

-- CreateIndex
CREATE INDEX "idx_resultado_ronda" ON "public"."Resultado"("id_ronda");

-- CreateIndex
CREATE INDEX "idx_resultado_votos" ON "public"."Resultado"("votos");

-- CreateIndex
CREATE INDEX "idx_resultado_candidato" ON "public"."Resultado"("id_candidato");

-- CreateIndex
CREATE UNIQUE INDEX "Resultado_id_ronda_id_candidato_key" ON "public"."Resultado"("id_ronda", "id_candidato");

-- CreateIndex
CREATE INDEX "idx_publicacion_eleccion" ON "public"."PublicacionResultado"("id_eleccion");

-- AddForeignKey
ALTER TABLE "public"."Sesion" ADD CONSTRAINT "Sesion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Auditoria" ADD CONSTRAINT "Auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Eleccion" ADD CONSTRAINT "Eleccion_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "public"."Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cargo" ADD CONSTRAINT "Cargo_id_catalogo_fkey" FOREIGN KEY ("id_catalogo") REFERENCES "public"."CatalogoCargo"("id_catalogo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cargo" ADD CONSTRAINT "Cargo_id_eleccion_fkey" FOREIGN KEY ("id_eleccion") REFERENCES "public"."Eleccion"("id_eleccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Candidato" ADD CONSTRAINT "Candidato_id_cargo_fkey" FOREIGN KEY ("id_cargo") REFERENCES "public"."Cargo"("id_cargo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ronda" ADD CONSTRAINT "Ronda_id_cargo_fkey" FOREIGN KEY ("id_cargo") REFERENCES "public"."Cargo"("id_cargo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resultado" ADD CONSTRAINT "Resultado_id_candidato_fkey" FOREIGN KEY ("id_candidato") REFERENCES "public"."Candidato"("id_candidato") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resultado" ADD CONSTRAINT "Resultado_id_ronda_fkey" FOREIGN KEY ("id_ronda") REFERENCES "public"."Ronda"("id_ronda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PublicacionResultado" ADD CONSTRAINT "PublicacionResultado_id_eleccion_fkey" FOREIGN KEY ("id_eleccion") REFERENCES "public"."Eleccion"("id_eleccion") ON DELETE RESTRICT ON UPDATE CASCADE;
