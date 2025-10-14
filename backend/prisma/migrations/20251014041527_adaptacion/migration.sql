/*
  Warnings:

  - A unique constraint covering the columns `[refresh_token]` on the table `Sesion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `absolute_expiry` to the `Sesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refresh_token` to the `Sesion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Sesion" ADD COLUMN     "absolute_expiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "refresh_token" VARCHAR(500) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_refresh_token_key" ON "public"."Sesion"("refresh_token");

-- CreateIndex
CREATE INDEX "idx_sesion_refresh_token" ON "public"."Sesion"("refresh_token");
