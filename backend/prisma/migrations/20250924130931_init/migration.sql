-- CreateTable
CREATE TABLE `Eleccion` (
    `id_eleccion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `fecha` DATE NOT NULL,
    `estado` ENUM('DRAFT', 'EN_CURSO', 'FINALIZADA') NOT NULL DEFAULT 'DRAFT',
    `descripcion` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_eleccion_fecha`(`fecha`),
    INDEX `idx_eleccion_estado`(`estado`),
    INDEX `idx_eleccion_fecha_estado`(`fecha`, `estado`),
    PRIMARY KEY (`id_eleccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CatalogoCargo` (
    `id_catalogo` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CatalogoCargo_nombre_key`(`nombre`),
    PRIMARY KEY (`id_catalogo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cargo` (
    `id_cargo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_eleccion` INTEGER NOT NULL,
    `id_catalogo` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'FINALIZADO') NOT NULL DEFAULT 'PENDIENTE',
    `orden` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_cargo_eleccion`(`id_eleccion`),
    INDEX `idx_cargo_estado`(`estado`),
    UNIQUE INDEX `Cargo_id_eleccion_orden_key`(`id_eleccion`, `orden`),
    PRIMARY KEY (`id_cargo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidato` (
    `id_candidato` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cargo` INTEGER NOT NULL,
    `nombre_completo` VARCHAR(150) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_candidato_cargo`(`id_cargo`),
    INDEX `idx_candidato_activo`(`activo`),
    UNIQUE INDEX `Candidato_id_cargo_nombre_completo_key`(`id_cargo`, `nombre_completo`),
    PRIMARY KEY (`id_candidato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ronda` (
    `id_ronda` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cargo` INTEGER NOT NULL,
    `numero_ronda` INTEGER NOT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalizada` BOOLEAN NOT NULL DEFAULT false,
    `observaciones` TEXT NULL,

    INDEX `idx_ronda_cargo`(`id_cargo`),
    INDEX `idx_ronda_fecha`(`fecha_registro`),
    UNIQUE INDEX `Ronda_id_cargo_numero_ronda_key`(`id_cargo`, `numero_ronda`),
    PRIMARY KEY (`id_ronda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resultado` (
    `id_resultado` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ronda` INTEGER NOT NULL,
    `id_candidato` INTEGER NOT NULL,
    `votos` INTEGER NOT NULL DEFAULT 0,
    `registrado_por` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_resultado_ronda`(`id_ronda`),
    INDEX `idx_resultado_votos`(`votos`),
    UNIQUE INDEX `Resultado_id_ronda_id_candidato_key`(`id_ronda`, `id_candidato`),
    PRIMARY KEY (`id_resultado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PublicacionResultado` (
    `id_publicacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_eleccion` INTEGER NOT NULL,
    `publicado_por` VARCHAR(50) NULL,
    `fecha_publicacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modo` ENUM('PROYECTOR', 'PDF', 'EXCEL') NOT NULL DEFAULT 'PROYECTOR',
    `nota` TEXT NULL,

    INDEX `idx_publicacion_eleccion`(`id_eleccion`),
    PRIMARY KEY (`id_publicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cargo` ADD CONSTRAINT `Cargo_id_eleccion_fkey` FOREIGN KEY (`id_eleccion`) REFERENCES `Eleccion`(`id_eleccion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cargo` ADD CONSTRAINT `Cargo_id_catalogo_fkey` FOREIGN KEY (`id_catalogo`) REFERENCES `CatalogoCargo`(`id_catalogo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Candidato` ADD CONSTRAINT `Candidato_id_cargo_fkey` FOREIGN KEY (`id_cargo`) REFERENCES `Cargo`(`id_cargo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ronda` ADD CONSTRAINT `Ronda_id_cargo_fkey` FOREIGN KEY (`id_cargo`) REFERENCES `Cargo`(`id_cargo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resultado` ADD CONSTRAINT `Resultado_id_ronda_fkey` FOREIGN KEY (`id_ronda`) REFERENCES `Ronda`(`id_ronda`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resultado` ADD CONSTRAINT `Resultado_id_candidato_fkey` FOREIGN KEY (`id_candidato`) REFERENCES `Candidato`(`id_candidato`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PublicacionResultado` ADD CONSTRAINT `PublicacionResultado_id_eleccion_fkey` FOREIGN KEY (`id_eleccion`) REFERENCES `Eleccion`(`id_eleccion`) ON DELETE RESTRICT ON UPDATE CASCADE;
