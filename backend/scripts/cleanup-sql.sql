-- Script para limpiar todas las tablas excepto CatalogoCargo
-- IMPORTANTE: Este script eliminará TODOS los datos excepto el catálogo de cargos

-- Deshabilitar verificación de foreign keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar datos de todas las tablas (en orden correcto)
DELETE FROM PublicacionResultado;
DELETE FROM Resultado;
DELETE FROM Ronda;
DELETE FROM Candidato;
DELETE FROM Cargo;
DELETE FROM Eleccion;

-- Reiniciar auto_increment para que los IDs empiecen desde 1
ALTER TABLE Eleccion AUTO_INCREMENT = 1;
ALTER TABLE Cargo AUTO_INCREMENT = 1;
ALTER TABLE Candidato AUTO_INCREMENT = 1;
ALTER TABLE Ronda AUTO_INCREMENT = 1;
ALTER TABLE Resultado AUTO_INCREMENT = 1;
ALTER TABLE PublicacionResultado AUTO_INCREMENT = 1;

-- Rehabilitar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que CatalogoCargo se mantiene
SELECT COUNT(*) as 'Registros en CatalogoCargo' FROM CatalogoCargo;

-- Mostrar estado de las tablas
SELECT 
    'Eleccion' as Tabla, COUNT(*) as Registros FROM Eleccion
UNION ALL
SELECT 
    'Cargo' as Tabla, COUNT(*) as Registros FROM Cargo
UNION ALL
SELECT 
    'Candidato' as Tabla, COUNT(*) as Registros FROM Candidato
UNION ALL
SELECT 
    'Ronda' as Tabla, COUNT(*) as Registros FROM Ronda
UNION ALL
SELECT 
    'Resultado' as Tabla, COUNT(*) as Registros FROM Resultado
UNION ALL
SELECT 
    'PublicacionResultado' as Tabla, COUNT(*) as Registros FROM PublicacionResultado
UNION ALL
SELECT 
    'CatalogoCargo' as Tabla, COUNT(*) as Registros FROM CatalogoCargo;

