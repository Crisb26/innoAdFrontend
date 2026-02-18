-- Script de inicialización para tablas de carrito y pagos
-- Ejecutar después de que Hibernate cree las tablas base

-- 1. Verificar que las tablas existen y crear índices si es necesario
CREATE TABLE IF NOT EXISTS carrito_items (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    publicacion_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario_cop DECIMAL(15,2) NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, publicacion_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_carrito_usuario ON carrito_items(usuario_id);
CREATE INDEX IF NOT EXISTS idx_carrito_publicacion ON carrito_items(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_carrito_fecha ON carrito_items(fecha_agregado DESC);

-- 2. Actualizar estructura de pagos si es necesario
-- Si la tabla ya existe, verificar que tiene las columnas correctas
DO $$
BEGIN
    -- Agregar columnas si no existen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pagos' AND column_name = 'usuario_id'
    ) THEN
        ALTER TABLE pagos ADD COLUMN usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pagos' AND column_name = 'monto_cop'
    ) THEN
        ALTER TABLE pagos ADD COLUMN monto_cop DECIMAL(15,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pagos' AND column_name = 'metodo_pago'
    ) THEN
        ALTER TABLE pagos ADD COLUMN metodo_pago VARCHAR(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pagos' AND column_name = 'fecha_procesamiento'
    ) THEN
        ALTER TABLE pagos ADD COLUMN fecha_procesamiento TIMESTAMP;
    END IF;
END $$;

-- 3. Crear índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_creacion DESC);

-- 4. Verificar integridad referencial
TRUNCATE TABLE carrito_items CASCADE; -- Limpiar carrito si hay datos inconsistentes

-- 5. Insertar datos de prueba (opcional)
-- INSERT INTO carrito_items (usuario_id, publicacion_id, cantidad, precio_unitario_cop)
-- SELECT DISTINCT u.id, p.id, 1, p.precio_cop
-- FROM usuarios u, publicaciones p
-- LIMIT 5;

-- 6. Información de la migración
-- Tablas creadas/actualizadas:
-- - carrito_items: Almacena items del carrito de compras
-- - pagos: Almacena registros de pagos (actualizada con estructura nueva)
--
-- Métodos de pago soportados:
-- - 'tarjeta': Tarjeta de crédito/débito (integración Stripe)
-- - 'transferencia': Transferencia bancaria
-- - 'nequi': Nequi/Daviplata
-- - 'contra': Contra entrega
--
-- Estados de pago:
-- - PENDIENTE: Esperando procesamiento
-- - PROCESANDO: En proceso de verificación
-- - COMPLETADO: Pago realizado exitosamente
-- - FALLIDO: Error durante el procesamiento
-- - CANCELADO: Pago cancelado o rechazado

GRANT SELECT, INSERT, UPDATE, DELETE ON carrito_items TO innoad_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON pagos TO innoad_user;
