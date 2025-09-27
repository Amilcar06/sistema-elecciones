-- CreateEnum
CREATE TYPE "public"."EstadoEleccion" AS ENUM ('DRAFT', 'EN_CURSO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "public"."EstadoCargo" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "public"."ModoPublicacion" AS ENUM ('PROYECTOR', 'PDF', 'EXCEL');

-- CreateTable
CREATE TABLE "public"."Eleccion" (
    "id_eleccion" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoEleccion" NOT NULL DEFAULT 'DRAFT',
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Eleccion_pkey" PRIMARY KEY ("id_eleccion")
);

-- CreateTable
CREATE TABLE "public"."CatalogoCargo" (
    "id_catalogo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id_cargo")
);

-- CreateTable
CREATE TABLE "public"."Candidato" (
    "id_candidato" SERIAL NOT NULL,
    "id_cargo" INTEGER NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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

    CONSTRAINT "Ronda_pkey" PRIMARY KEY ("id_ronda")
);

-- CreateTable
CREATE TABLE "public"."Resultado" (
    "id_resultado" SERIAL NOT NULL,
    "id_ronda" INTEGER NOT NULL,
    "id_candidato" INTEGER NOT NULL,
    "votos" INTEGER NOT NULL DEFAULT 0,
    "registrado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateTable
CREATE TABLE "public"."PublicacionResultado" (
    "id_publicacion" SERIAL NOT NULL,
    "id_eleccion" INTEGER NOT NULL,
    "publicado_por" TEXT,
    "fecha_publicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modo" "public"."ModoPublicacion" NOT NULL DEFAULT 'PROYECTOR',
    "nota" TEXT,

    CONSTRAINT "PublicacionResultado_pkey" PRIMARY KEY ("id_publicacion")
);

-- CreateIndex
CREATE INDEX "idx_eleccion_fecha" ON "public"."Eleccion"("fecha");

-- CreateIndex
CREATE INDEX "idx_eleccion_estado" ON "public"."Eleccion"("estado");

-- CreateIndex
CREATE INDEX "idx_eleccion_fecha_estado" ON "public"."Eleccion"("fecha", "estado");

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
