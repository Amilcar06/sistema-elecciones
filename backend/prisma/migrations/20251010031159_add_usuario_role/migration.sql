-- AlterEnum
ALTER TYPE "public"."RolUsuario" ADD VALUE 'USUARIO';

-- Commit the enum change
COMMIT;

-- AlterTable
ALTER TABLE "public"."Usuario" ALTER COLUMN "rol" SET DEFAULT 'USUARIO';
