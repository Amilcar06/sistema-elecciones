-- AlterEnum
ALTER TYPE "public"."RolUsuario" ADD VALUE 'USUARIO';

-- AlterTable
ALTER TABLE "public"."Usuario" ALTER COLUMN "rol" SET DEFAULT 'USUARIO';
