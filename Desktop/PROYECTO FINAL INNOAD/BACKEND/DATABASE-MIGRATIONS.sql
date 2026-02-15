-- =====================================================================
-- DATABASE MIGRATIONS PARA INNOAD
-- Ejecutar este script en PostgreSQL para crear/actualizar las tablas
-- =====================================================================

-- 1. TABLA DE CAMPAÑAS (para Campaign CRUD)
CREATE TABLE IF NOT EXISTS campanas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    usuario_id BIGINT NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prioridad INTEGER DEFAULT 5,
    configuracion TEXT,
    reproducciones_totales BIGINT DEFAULT 0,
    pantallas_activas INTEGER DEFAULT 0,
    CONSTRAINT fk_campanas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campanas_usuario ON campanas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_campanas_estado ON campanas(estado);
CREATE INDEX IF NOT EXISTS idx_campanas_fecha ON campanas(fecha_creacion DESC);

-- 2. TABLA DE CONTENIDOS EN CAMPAÑAS (relación M:N)
CREATE TABLE IF NOT EXISTS campana_contenidos (
    campana_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    CONSTRAINT pk_campana_contenidos PRIMARY KEY (campana_id, contenido_id),
    CONSTRAINT fk_campana_contenidos_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campana_contenidos_campana ON campana_contenidos(campana_id);
CREATE INDEX IF NOT EXISTS idx_campana_contenidos_contenido ON campana_contenidos(contenido_id);

-- 3. TABLA DE PANTALLAS EN CAMPAÑAS (relación M:N)
CREATE TABLE IF NOT EXISTS campana_pantallas (
    campana_id BIGINT NOT NULL,
    pantalla_id BIGINT NOT NULL,
    CONSTRAINT pk_campana_pantallas PRIMARY KEY (campana_id, pantalla_id),
    CONSTRAINT fk_campana_pantallas_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campana_pantallas_campana ON campana_pantallas(campana_id);
CREATE INDEX IF NOT EXISTS idx_campana_pantallas_pantalla ON campana_pantallas(pantalla_id);

-- 4. TABLA DE TAGS DE CAMPAÑAS
CREATE TABLE IF NOT EXISTS campana_tags (
    campana_id BIGINT NOT NULL,
    tag VARCHAR(255) NOT NULL,
    CONSTRAINT fk_campana_tags_campana FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_campana_tags_campana ON campana_tags(campana_id);

-- 5. AGREGAR COLUMNA DE USUARIO A CONTENIDOS (si no existe)
ALTER TABLE contenidos
ADD COLUMN IF NOT EXISTS usuario_id BIGINT;

ALTER TABLE contenidos
ADD CONSTRAINT IF NOT EXISTS fk_contenidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_contenidos_usuario ON contenidos(usuario_id);

-- 6. TABLA DE CHATS
CREATE TABLE IF NOT EXISTS chats (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    usuario_id BIGINT NOT NULL,
    tecnico_id BIGINT,
    admin_id BIGINT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_transferencia TIMESTAMP,
    fecha_cierre TIMESTAMP,
    CONSTRAINT fk_chats_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_chats_tecnico FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_chats_admin FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chats_usuario ON chats(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chats_tecnico ON chats(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_chats_admin ON chats(admin_id);
CREATE INDEX IF NOT EXISTS idx_chats_estado ON chats(estado);
CREATE INDEX IF NOT EXISTS idx_chats_fecha ON chats(fecha_creacion DESC);

-- 7. TABLA DE MENSAJES DE CHAT
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    emisor_id BIGINT NOT NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'TEXTO',
    archivo_url VARCHAR(500),
    leido BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,
    CONSTRAINT fk_mensajes_chat_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensajes_chat_emisor FOREIGN KEY (emisor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mensajes_chat_chat ON mensajes_chat(chat_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_emisor ON mensajes_chat(emisor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_fecha ON mensajes_chat(fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_leido ON mensajes_chat(leido);

-- 8. TABLA DE PRESENCIA DE USUARIOS
CREATE TABLE IF NOT EXISTS presencia_usuarios (
    usuario_id BIGINT PRIMARY KEY,
    estado VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
    ultima_actividad TIMESTAMP,
    ultima_conexion TIMESTAMP,
    CONSTRAINT fk_presencia_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_presencia_estado ON presencia_usuarios(estado);

-- 9. TABLA DE REPORTES
CREATE TABLE IF NOT EXISTS reportes (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL,
    contenido TEXT,
    usuario_id BIGINT NOT NULL,
    fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reportes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha_generacion DESC);

-- 10. TABLA DE ESTADÍSTICAS DE CAMPAÑAS
CREATE TABLE IF NOT EXISTS estadisticas_campanas (
    id BIGSERIAL PRIMARY KEY,
    campana_id BIGINT NOT NULL,
    pantalla_id BIGINT,
    reproducciones INTEGER DEFAULT 0,
    tiempo_total BIGINT DEFAULT 0,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_estadisticas_campanas FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_estadisticas_campanas_campana ON estadisticas_campanas(campana_id);
CREATE INDEX IF NOT EXISTS idx_estadisticas_campanas_fecha ON estadisticas_campanas(fecha_registro DESC);

-- 11. VERIFICAR ESTRUTURA TABLA USUARIOS (asegurar campos necesarios)
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS rol VARCHAR(20) NOT NULL DEFAULT 'USUARIO';

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

-- 12. CREAR ÍNDICES PARA CONSULTAS FRECUENTES
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- =====================================================================
-- VERIFICACIÓN
-- =====================================================================
-- Listar todas las tablas creadas:
-- \dt
--
-- Listar índices:
-- \di
--
-- Verificar estructura de tabla:
-- \d campanas
-- \d chats
-- \d mensajes_chat
-- =====================================================================

COMMIT;
