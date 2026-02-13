DROP DATABASE IF EXISTS innoad_db;
CREATE DATABASE innoad_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c innoad_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(100) GENERATED ALWAYS AS (nombre || ' ' || apellido) STORED,
    telefono VARCHAR(20),
    avatar_url VARCHAR(500),
    empresa VARCHAR(100),
    cargo VARCHAR(100),
    pais VARCHAR(50),
    ciudad VARCHAR(100),
    direccion VARCHAR(255),
    codigo_postal VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    bloqueado BOOLEAN DEFAULT FALSE,
    intentos_fallidos INTEGER DEFAULT 0,
    ultimo_acceso TIMESTAMP,
    ultima_ip VARCHAR(50),
    preferencias JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por BIGINT,
    actualizado_por BIGINT
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    nivel INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    es_sistema BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permisos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    es_sistema BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario_roles (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    asignado_por BIGINT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    UNIQUE(usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rol_permisos (
    id BIGSERIAL PRIMARY KEY,
    rol_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    ip_solicitud VARCHAR(50),
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categorias_campana (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(7),
    icono VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campanas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    objetivo TEXT,
    categoria_id BIGINT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    presupuesto DECIMAL(15,2),
    gasto_actual DECIMAL(15,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'borrador',
    prioridad INTEGER DEFAULT 1,
    alcance_esperado INTEGER,
    alcance_actual INTEGER DEFAULT 0,
    roi DECIMAL(10,2),
    activa BOOLEAN DEFAULT TRUE,
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    aprobada BOOLEAN DEFAULT FALSE,
    aprobada_por BIGINT,
    fecha_aprobacion TIMESTAMP,
    notas_internas TEXT,
    tags VARCHAR(255)[],
    metadata JSONB DEFAULT '{}',
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_campana(id) ON DELETE SET NULL,
    FOREIGN KEY (aprobada_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS categorias_contenido (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo_permitido VARCHAR(50)[],
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contenidos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL,
    categoria_id BIGINT,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duracion_segundos INTEGER DEFAULT 10,
    tamano_bytes BIGINT,
    resolucion VARCHAR(20),
    formato VARCHAR(20),
    calidad VARCHAR(20),
    fps INTEGER,
    hash_archivo VARCHAR(64),
    activo BOOLEAN DEFAULT TRUE,
    aprobado BOOLEAN DEFAULT FALSE,
    aprobado_por BIGINT,
    fecha_aprobacion TIMESTAMP,
    rechazado BOOLEAN DEFAULT FALSE,
    motivo_rechazo TEXT,
    visualizaciones INTEGER DEFAULT 0,
    descargas INTEGER DEFAULT 0,
    puntuacion DECIMAL(3,2),
    tags VARCHAR(255)[],
    metadata JSONB DEFAULT '{}',
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_contenido(id) ON DELETE SET NULL,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS versiones_contenido (
    id BIGSERIAL PRIMARY KEY,
    contenido_id BIGINT NOT NULL,
    version INTEGER NOT NULL,
    url VARCHAR(500) NOT NULL,
    cambios TEXT,
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(contenido_id, version)
);

CREATE TABLE IF NOT EXISTS publicidades (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    cliente VARCHAR(100),
    tipo VARCHAR(50) NOT NULL,
    url_destino VARCHAR(500),
    impresiones_objetivo INTEGER,
    impresiones_actuales INTEGER DEFAULT 0,
    costo_por_impresion DECIMAL(10,4),
    presupuesto_total DECIMAL(15,2),
    gasto_actual DECIMAL(15,2) DEFAULT 0,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    activa BOOLEAN DEFAULT TRUE,
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS publicidad_contenidos (
    id BIGSERIAL PRIMARY KEY,
    publicidad_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    orden INTEGER DEFAULT 1,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publicidad_id, contenido_id),
    FOREIGN KEY (publicidad_id) REFERENCES publicidades(id) ON DELETE CASCADE,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campana_contenidos (
    id BIGSERIAL PRIMARY KEY,
    campana_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    orden INTEGER DEFAULT 1,
    duracion_segundos INTEGER DEFAULT 10,
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campana_id, contenido_id),
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ubicaciones (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    pais VARCHAR(50),
    estado_provincia VARCHAR(100),
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    direccion VARCHAR(255),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    zona VARCHAR(100),
    trafico_estimado INTEGER,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispositivos_raspberry (
    id BIGSERIAL PRIMARY KEY,
    codigo_dispositivo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    modelo VARCHAR(50),
    version_os VARCHAR(50),
    mac_address VARCHAR(17) UNIQUE,
    ip_address VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'inactivo',
    bateria_nivel INTEGER,
    temperatura DECIMAL(5,2),
    uso_cpu DECIMAL(5,2),
    uso_memoria DECIMAL(5,2),
    espacio_disco BIGINT,
    version_software VARCHAR(50),
    ultima_actualizacion TIMESTAMP,
    ultima_conexion TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pantallas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_unico VARCHAR(50) UNIQUE NOT NULL,
    dispositivo_id BIGINT,
    ubicacion_id BIGINT,
    tipo VARCHAR(50) DEFAULT 'digital',
    descripcion TEXT,
    resolucion VARCHAR(20),
    pulgadas DECIMAL(5,2),
    orientacion VARCHAR(20) DEFAULT 'horizontal',
    brillo INTEGER DEFAULT 100,
    contraste INTEGER DEFAULT 50,
    volumen INTEGER DEFAULT 50,
    estado VARCHAR(20) DEFAULT 'inactiva',
    modo_operacion VARCHAR(20) DEFAULT 'automatico',
    horario_inicio TIME,
    horario_fin TIME,
    dias_operacion VARCHAR(50)[] DEFAULT ARRAY['lunes','martes','miercoles','jueves','viernes','sabado','domingo'],
    activa BOOLEAN DEFAULT TRUE,
    mantenimiento BOOLEAN DEFAULT FALSE,
    ultima_conexion TIMESTAMP,
    proximo_mantenimiento DATE,
    costo_instalacion DECIMAL(15,2),
    costo_mensual DECIMAL(15,2),
    nota_interna TEXT,
    tags VARCHAR(255)[],
    metadata JSONB DEFAULT '{}',
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos_raspberry(id) ON DELETE SET NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS grupos_pantallas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7),
    activo BOOLEAN DEFAULT TRUE,
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pantalla_grupos (
    id BIGSERIAL PRIMARY KEY,
    pantalla_id BIGINT NOT NULL,
    grupo_id BIGINT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pantalla_id, grupo_id),
    FOREIGN KEY (pantalla_id) REFERENCES pantallas(id) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupos_pantallas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campana_pantallas (
    id BIGSERIAL PRIMARY KEY,
    campana_id BIGINT NOT NULL,
    pantalla_id BIGINT NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campana_id, pantalla_id),
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE,
    FOREIGN KEY (pantalla_id) REFERENCES pantallas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS programacion_contenidos (
    id BIGSERIAL PRIMARY KEY,
    pantalla_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    campana_id BIGINT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    dias_semana VARCHAR(50)[],
    prioridad INTEGER DEFAULT 1,
    repeticiones INTEGER,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pantalla_id) REFERENCES pantallas(id) ON DELETE CASCADE,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS estadisticas (
    id BIGSERIAL PRIMARY KEY,
    campana_id BIGINT NOT NULL,
    contenido_id BIGINT,
    pantalla_id BIGINT,
    publicidad_id BIGINT,
    impresiones INTEGER DEFAULT 0,
    visualizaciones_completas INTEGER DEFAULT 0,
    clics INTEGER DEFAULT 0,
    interacciones INTEGER DEFAULT 0,
    duracion_total_segundos INTEGER DEFAULT 0,
    duracion_promedio_segundos DECIMAL(10,2),
    alcance_unico INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    fecha_estadistica DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    franja_horaria VARCHAR(20),
    dia_semana VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE CASCADE,
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE SET NULL,
    FOREIGN KEY (pantalla_id) REFERENCES pantallas(id) ON DELETE SET NULL,
    FOREIGN KEY (publicidad_id) REFERENCES publicidades(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS metricas_dispositivos (
    id BIGSERIAL PRIMARY KEY,
    dispositivo_id BIGINT NOT NULL,
    pantalla_id BIGINT,
    temperatura DECIMAL(5,2),
    uso_cpu DECIMAL(5,2),
    uso_memoria DECIMAL(5,2),
    uso_disco DECIMAL(5,2),
    estado_red VARCHAR(20),
    velocidad_red_mbps DECIMAL(10,2),
    tiempo_encendido_segundos BIGINT,
    reinicios INTEGER DEFAULT 0,
    errores INTEGER DEFAULT 0,
    advertencias INTEGER DEFAULT 0,
    fecha_metrica TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos_raspberry(id) ON DELETE CASCADE,
    FOREIGN KEY (pantalla_id) REFERENCES pantallas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS eventos_pantalla (
    id BIGSERIAL PRIMARY KEY,
    pantalla_id BIGINT NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    descripcion TEXT,
    severidad VARCHAR(20) DEFAULT 'info',
    datos JSONB DEFAULT '{}',
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pantalla_id) REFERENCES pantallas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reportes (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    formato VARCHAR(20) DEFAULT 'pdf',
    descripcion TEXT,
    campana_id BIGINT,
    fecha_inicio DATE,
    fecha_fin DATE,
    url_archivo VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'generando',
    datos JSONB DEFAULT '{}',
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tareas (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) DEFAULT 'general',
    prioridad VARCHAR(20) DEFAULT 'media',
    estado VARCHAR(20) DEFAULT 'pendiente',
    campana_id BIGINT,
    asignado_a BIGINT,
    asignado_por BIGINT NOT NULL,
    fecha_vencimiento TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_finalizacion TIMESTAMP,
    tiempo_estimado_horas DECIMAL(10,2),
    tiempo_real_horas DECIMAL(10,2),
    progreso INTEGER DEFAULT 0,
    notas TEXT,
    archivos_adjuntos VARCHAR(500)[],
    tags VARCHAR(255)[],
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE SET NULL,
    FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentarios_tarea (
    id BIGSERIAL PRIMARY KEY,
    tarea_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    comentario TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reuniones (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) DEFAULT 'presencial',
    ubicacion VARCHAR(255),
    url_virtual VARCHAR(500),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'programada',
    recordatorio_minutos INTEGER DEFAULT 15,
    campana_id BIGINT,
    notas TEXT,
    acta TEXT,
    organizado_por BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE SET NULL,
    FOREIGN KEY (organizado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reunion_participantes (
    id BIGSERIAL PRIMARY KEY,
    reunion_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    rol VARCHAR(50) DEFAULT 'participante',
    confirmado BOOLEAN DEFAULT FALSE,
    asistio BOOLEAN DEFAULT FALSE,
    fecha_confirmacion TIMESTAMP,
    UNIQUE(reunion_id, usuario_id),
    FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anuncios (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'informativo',
    prioridad VARCHAR(20) DEFAULT 'normal',
    destinatarios VARCHAR(50) DEFAULT 'todos',
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    visto_por INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    publicado_por BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    razon_social VARCHAR(200),
    rfc_nit VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    sitio_web VARCHAR(255),
    industria VARCHAR(100),
    tamano_empresa VARCHAR(50),
    pais VARCHAR(50),
    ciudad VARCHAR(100),
    direccion VARCHAR(255),
    codigo_postal VARCHAR(20),
    contacto_principal VARCHAR(100),
    cargo_contacto VARCHAR(100),
    email_contacto VARCHAR(100),
    telefono_contacto VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'activo',
    tipo VARCHAR(50) DEFAULT 'regular',
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    credito_disponible DECIMAL(15,2) DEFAULT 0,
    notas TEXT,
    usuario_asignado BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_asignado) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contratos (
    id BIGSERIAL PRIMARY KEY,
    numero_contrato VARCHAR(50) UNIQUE NOT NULL,
    cliente_id BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) DEFAULT 'servicio',
    valor_total DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USD',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    terminos TEXT,
    clausulas TEXT,
    estado VARCHAR(20) DEFAULT 'borrador',
    renovacion_automatica BOOLEAN DEFAULT FALSE,
    dias_aviso_renovacion INTEGER DEFAULT 30,
    archivo_url VARCHAR(500),
    firmado_cliente BOOLEAN DEFAULT FALSE,
    fecha_firma_cliente DATE,
    firmado_empresa BOOLEAN DEFAULT FALSE,
    fecha_firma_empresa DATE,
    creado_por BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS facturas (
    id BIGSERIAL PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    cliente_id BIGINT NOT NULL,
    contrato_id BIGINT,
    tipo VARCHAR(50) DEFAULT 'venta',
    subtotal DECIMAL(15,2) NOT NULL,
    impuesto_porcentaje DECIMAL(5,2) DEFAULT 0,
    impuesto_monto DECIMAL(15,2) DEFAULT 0,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    descuento_monto DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USD',
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    metodo_pago VARCHAR(50),
    referencia_pago VARCHAR(100),
    notas TEXT,
    terminos_pago TEXT,
    archivo_url VARCHAR(500),
    enviada BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP,
    creada_por BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE SET NULL,
    FOREIGN KEY (creada_por) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items_factura (
    id BIGSERIAL PRIMARY KEY,
    factura_id BIGINT NOT NULL,
    campana_id BIGINT,
    descripcion VARCHAR(255) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    impuesto_porcentaje DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (campana_id) REFERENCES campanas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pagos (
    id BIGSERIAL PRIMARY KEY,
    factura_id BIGINT NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USD',
    metodo VARCHAR(50) NOT NULL,
    referencia VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'completado',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    procesado_por BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (procesado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS alertas (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    severidad VARCHAR(20) DEFAULT 'info',
    entidad VARCHAR(100),
    entidad_id BIGINT,
    origen VARCHAR(100),
    usuario_id BIGINT,
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP,
    requiere_accion BOOLEAN DEFAULT FALSE,
    accion_tomada BOOLEAN DEFAULT FALSE,
    descripcion_accion TEXT,
    fecha_accion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100),
    entidad_id BIGINT,
    descripcion TEXT,
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    ip VARCHAR(50),
    user_agent TEXT,
    metodo_http VARCHAR(10),
    url VARCHAR(500),
    parametros TEXT,
    resultado VARCHAR(20),
    duracion_ms INTEGER,
    codigo_respuesta INTEGER,
    mensaje_error TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL,
    origen VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    excepcion TEXT,
    stack_trace TEXT,
    contexto JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sesiones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    dispositivo VARCHAR(100),
    navegador VARCHAR(100),
    sistema_operativo VARCHAR(100),
    ip VARCHAR(50),
    ubicacion_ip VARCHAR(255),
    user_agent TEXT,
    activa BOOLEAN DEFAULT TRUE,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'info',
    prioridad VARCHAR(20) DEFAULT 'normal',
    categoria VARCHAR(50),
    icono VARCHAR(50),
    color VARCHAR(7),
    leida BOOLEAN DEFAULT FALSE,
    url VARCHAR(500),
    accion_disponible BOOLEAN DEFAULT FALSE,
    accion_texto VARCHAR(100),
    accion_url VARCHAR(500),
    fecha_lectura TIMESTAMP,
    enviada_email BOOLEAN DEFAULT FALSE,
    fecha_envio_email TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plantillas_notificacion (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    variables VARCHAR(100)[],
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agentes_ia (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) DEFAULT 'gpt-4',
    temperatura DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    prompt_sistema TEXT,
    prompt_contexto TEXT,
    funciones_disponibles VARCHAR(100)[],
    configuracion JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT TRUE,
    uso_total INTEGER DEFAULT 0,
    costo_total DECIMAL(15,4) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversaciones_ia (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    agente_ia_id BIGINT NOT NULL,
    titulo VARCHAR(200),
    contexto TEXT,
    estado VARCHAR(20) DEFAULT 'activa',
    activa BOOLEAN DEFAULT TRUE,
    total_mensajes INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    costo_total DECIMAL(10,4) DEFAULT 0,
    puntuacion INTEGER,
    feedback TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (agente_ia_id) REFERENCES agentes_ia(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mensajes_ia (
    id BIGSERIAL PRIMARY KEY,
    conversacion_id BIGINT NOT NULL,
    rol VARCHAR(20) NOT NULL,
    contenido TEXT NOT NULL,
    modelo VARCHAR(50),
    tokens_prompt INTEGER,
    tokens_completion INTEGER,
    tokens_totales INTEGER,
    costo DECIMAL(10,6),
    tiempo_respuesta_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones_ia(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS archivos (
    id BIGSERIAL PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenado VARCHAR(255) UNIQUE NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    extension VARCHAR(20),
    tamano_bytes BIGINT,
    hash_md5 VARCHAR(32),
    hash_sha256 VARCHAR(64),
    carpeta VARCHAR(255),
    es_publico BOOLEAN DEFAULT FALSE,
    descargas INTEGER DEFAULT 0,
    entidad VARCHAR(100),
    entidad_id BIGINT,
    usuario_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'string',
    descripcion TEXT,
    categoria VARCHAR(50),
    editable BOOLEAN DEFAULT TRUE,
    visible BOOLEAN DEFAULT TRUE,
    opciones VARCHAR(255)[],
    validacion VARCHAR(255),
    orden INTEGER DEFAULT 0,
    modificado_por BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modificado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS plantillas_email (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    cuerpo_html TEXT NOT NULL,
    cuerpo_texto TEXT,
    variables VARCHAR(100)[],
    categoria VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cola_emails (
    id BIGSERIAL PRIMARY KEY,
    destinatario VARCHAR(100) NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    cuerpo_html TEXT NOT NULL,
    cuerpo_texto TEXT,
    plantilla_id BIGINT,
    prioridad INTEGER DEFAULT 5,
    estado VARCHAR(20) DEFAULT 'pendiente',
    intentos INTEGER DEFAULT 0,
    max_intentos INTEGER DEFAULT 3,
    error TEXT,
    fecha_envio TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plantilla_id) REFERENCES plantillas_email(id) ON DELETE SET NULL
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_verificado ON usuarios(verificado);
CREATE INDEX idx_campanas_usuario_id ON campanas(usuario_id);
CREATE INDEX idx_campanas_estado ON campanas(estado);
CREATE INDEX idx_campanas_fecha_inicio ON campanas(fecha_inicio);
CREATE INDEX idx_campanas_fecha_fin ON campanas(fecha_fin);
CREATE INDEX idx_campanas_activa ON campanas(activa);
CREATE INDEX idx_contenidos_usuario_id ON contenidos(usuario_id);
CREATE INDEX idx_contenidos_tipo ON contenidos(tipo);
CREATE INDEX idx_contenidos_activo ON contenidos(activo);
CREATE INDEX idx_contenidos_aprobado ON contenidos(aprobado);
CREATE INDEX idx_pantallas_codigo_unico ON pantallas(codigo_unico);
CREATE INDEX idx_pantallas_estado ON pantallas(estado);
CREATE INDEX idx_pantallas_usuario_id ON pantallas(usuario_id);
CREATE INDEX idx_pantallas_activa ON pantallas(activa);
CREATE INDEX idx_dispositivos_codigo ON dispositivos_raspberry(codigo_dispositivo);
CREATE INDEX idx_dispositivos_estado ON dispositivos_raspberry(estado);
CREATE INDEX idx_estadisticas_campana_id ON estadisticas(campana_id);
CREATE INDEX idx_estadisticas_contenido_id ON estadisticas(contenido_id);
CREATE INDEX idx_estadisticas_pantalla_id ON estadisticas(pantalla_id);
CREATE INDEX idx_estadisticas_fecha ON estadisticas(fecha_estadistica);
CREATE INDEX idx_tareas_asignado_a ON tareas(asignado_a);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);
CREATE INDEX idx_reuniones_fecha_inicio ON reuniones(fecha_inicio);
CREATE INDEX idx_reuniones_organizado_por ON reuniones(organizado_por);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_facturas_fecha_emision ON facturas(fecha_emision);
CREATE INDEX idx_logs_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_accion ON logs_auditoria(accion);
CREATE INDEX idx_logs_entidad ON logs_auditoria(entidad);
CREATE INDEX idx_logs_fecha ON logs_auditoria(fecha_creacion);
CREATE INDEX idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_activa ON sesiones(activa);
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX idx_alertas_usuario_id ON alertas(usuario_id);
CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_leida ON alertas(leida);
CREATE INDEX idx_archivos_usuario_id ON archivos(usuario_id);
CREATE INDEX idx_archivos_hash_md5 ON archivos(hash_md5);
CREATE INDEX idx_cola_emails_estado ON cola_emails(estado);
CREATE INDEX idx_cola_emails_fecha_creacion ON cola_emails(fecha_creacion);

CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'fecha_actualizacion'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trigger_actualizar_%I BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION actualizar_fecha_actualizacion();',
            t.table_name, t.table_name
        );
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION actualizar_estadisticas_campana()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE campanas SET 
        gasto_actual = COALESCE((SELECT SUM(costo) FROM estadisticas WHERE campana_id = NEW.campana_id), 0),
        alcance_actual = COALESCE((SELECT SUM(alcance_unico) FROM estadisticas WHERE campana_id = NEW.campana_id), 0)
    WHERE id = NEW.campana_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estadisticas_campana 
AFTER INSERT OR UPDATE ON estadisticas 
FOR EACH ROW EXECUTE FUNCTION actualizar_estadisticas_campana();

CREATE OR REPLACE FUNCTION actualizar_metricas_contenido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contenidos SET
        visualizaciones = COALESCE((SELECT SUM(impresiones) FROM estadisticas WHERE contenido_id = NEW.contenido_id), 0)
    WHERE id = NEW.contenido_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_metricas_contenido 
AFTER INSERT OR UPDATE ON estadisticas 
FOR EACH ROW EXECUTE FUNCTION actualizar_metricas_contenido();

CREATE OR REPLACE FUNCTION verificar_sesiones_usuario()
RETURNS TRIGGER AS $$
DECLARE
    max_sesiones INTEGER;
    sesiones_activas INTEGER;
BEGIN
    SELECT valor::INTEGER INTO max_sesiones 
    FROM configuracion_sistema 
    WHERE clave = 'usuarios.max_sesiones';
    
    SELECT COUNT(*) INTO sesiones_activas 
    FROM sesiones 
    WHERE usuario_id = NEW.usuario_id AND activa = true;
    
    IF sesiones_activas >= max_sesiones THEN
        UPDATE sesiones SET activa = false 
        WHERE id IN (
            SELECT id FROM sesiones 
            WHERE usuario_id = NEW.usuario_id AND activa = true 
            ORDER BY fecha_creacion ASC 
            LIMIT 1
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_sesiones 
BEFORE INSERT ON sesiones 
FOR EACH ROW EXECUTE FUNCTION verificar_sesiones_usuario();

INSERT INTO roles (nombre, descripcion) VALUES
('ROLE_ADMIN', 'Administrador del sistema con acceso completo'),
('ROLE_TECNICO', 'Técnico con permisos de configuración'),
('ROLE_DEVELOPER', 'Desarrollador con acceso a herramientas'),
('ROLE_USUARIO', 'Usuario estándar')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO permisos (nombre, descripcion, modulo) VALUES
('usuarios.ver', 'Ver usuarios', 'usuarios'),
('usuarios.crear', 'Crear usuarios', 'usuarios'),
('usuarios.editar', 'Editar usuarios', 'usuarios'),
('usuarios.eliminar', 'Eliminar usuarios', 'usuarios'),
('campanas.ver', 'Ver campañas', 'campanas'),
('campanas.crear', 'Crear campañas', 'campanas'),
('campanas.editar', 'Editar campañas', 'campanas'),
('campanas.eliminar', 'Eliminar campañas', 'campanas'),
('contenidos.ver', 'Ver contenidos', 'contenidos'),
('contenidos.crear', 'Crear contenidos', 'contenidos'),
('contenidos.editar', 'Editar contenidos', 'contenidos'),
('contenidos.eliminar', 'Eliminar contenidos', 'contenidos'),
('contenidos.aprobar', 'Aprobar contenidos', 'contenidos'),
('pantallas.ver', 'Ver pantallas', 'pantallas'),
('pantallas.crear', 'Crear pantallas', 'pantallas'),
('pantallas.editar', 'Editar pantallas', 'pantallas'),
('pantallas.eliminar', 'Eliminar pantallas', 'pantallas'),
('estadisticas.ver', 'Ver estadísticas', 'estadisticas'),
('estadisticas.exportar', 'Exportar estadísticas', 'estadisticas'),
('sistema.configurar', 'Configurar sistema', 'sistema'),
('sistema.logs', 'Ver logs del sistema', 'sistema'),
('sistema.monitoreo', 'Acceder a monitoreo', 'sistema'),
('ia.usar', 'Usar asistente IA', 'ia'),
('ia.configurar', 'Configurar agentes IA', 'ia')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'ROLE_TECNICO'
AND p.nombre IN (
    'campanas.ver', 'campanas.crear', 'campanas.editar',
    'contenidos.ver', 'contenidos.crear', 'contenidos.editar',
    'pantallas.ver', 'pantallas.editar', 'estadisticas.ver',
    'sistema.configurar', 'sistema.logs', 'ia.usar'
)
ON CONFLICT DO NOTHING;

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'ROLE_DEVELOPER'
AND p.nombre IN (
    'campanas.ver', 'contenidos.ver', 'contenidos.crear',
    'pantallas.ver', 'estadisticas.ver', 'sistema.logs',
    'ia.usar', 'ia.configurar'
)
ON CONFLICT DO NOTHING;

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'ROLE_USUARIO'
AND p.nombre IN (
    'campanas.ver', 'contenidos.ver', 'contenidos.crear',
    'estadisticas.ver', 'ia.usar'
)
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (nombre_usuario, email, password, nombre_completo, activo, verificado) VALUES
('admin', 'admin@innoad.com', '$2a$10$N9qo8uLOiCkgX2ZMROZOmeIjZaGcfL7P92LDGxAd68lJzDL17lhwy', 'Administrador del Sistema', true, true)
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO usuarios (nombre_usuario, email, password, nombre_completo, activo, verificado) VALUES
('tecnico', 'tecnico@innoad.com', '$2a$10$N9qo8uLOiCkgX2ZMROZOmeIjZaGcfL7P92LDGxAd68lJzDL17lhwy', 'Técnico del Sistema', true, true)
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO usuarios (nombre_usuario, email, password, nombre_completo, activo, verificado) VALUES
('dev', 'dev@innoad.com', '$2a$10$N9qo8uLOiCkgX2ZMROZOmeIjZaGcfL7P92LDGxAd68lJzDL17lhwy', 'Desarrollador', true, true)
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO usuarios (nombre_usuario, email, password, nombre_completo, activo, verificado) VALUES
('usuario', 'usuario@innoad.com', '$2a$10$N9qo8uLOiCkgX2ZMROZOmeIjZaGcfL7P92LDGxAd68lJzDL17lhwy', 'Usuario Estándar', true, true)
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r WHERE u.nombre_usuario = 'admin' AND r.nombre = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r WHERE u.nombre_usuario = 'tecnico' AND r.nombre = 'ROLE_TECNICO'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r WHERE u.nombre_usuario = 'dev' AND r.nombre = 'ROLE_DEVELOPER'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r WHERE u.nombre_usuario = 'usuario' AND r.nombre = 'ROLE_USUARIO'
ON CONFLICT DO NOTHING;

INSERT INTO agentes_ia (nombre, tipo, prompt_sistema, configuracion) VALUES
('Asistente InnoAd', 'general', 'Eres un asistente virtual especializado en publicidad digital y gestión de campañas.', '{"modelo": "gpt-4", "temperatura": 0.7, "max_tokens": 2000}')
ON CONFLICT DO NOTHING;

INSERT INTO categorias_campana (nombre, descripcion, icono, color) VALUES
('Marketing', 'Campañas de marketing general', 'fa-bullhorn', '#3498db'),
('Ventas', 'Campañas orientadas a ventas', 'fa-shopping-cart', '#2ecc71'),
('Branding', 'Campañas de posicionamiento de marca', 'fa-star', '#f39c12'),
('Promoción', 'Ofertas y promociones especiales', 'fa-tags', '#e74c3c'),
('Eventos', 'Publicidad para eventos', 'fa-calendar', '#9b59b6')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO categorias_contenido (nombre, descripcion, icono, color) VALUES
('Video', 'Contenido de video', 'fa-video', '#e74c3c'),
('Imagen', 'Imágenes estáticas', 'fa-image', '#3498db'),
('Carrusel', 'Presentaciones múltiples', 'fa-images', '#2ecc71'),
('Interactivo', 'Contenido interactivo', 'fa-hand-pointer', '#9b59b6'),
('Texto', 'Contenido de texto', 'fa-font', '#95a5a6')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, editable, visible) VALUES
('sistema.nombre', 'InnoAd', 'string', 'Nombre del sistema', 'general', false, true),
('sistema.version', '2.0.0', 'string', 'Versión del sistema', 'general', false, true),
('sistema.mantenimiento', 'false', 'boolean', 'Modo mantenimiento', 'general', true, true),
('usuarios.max_sesiones', '3', 'integer', 'Máximo sesiones simultáneas', 'seguridad', true, true),
('usuarios.intentos_max', '5', 'integer', 'Intentos de login antes de bloquear', 'seguridad', true, true),
('contenidos.tamano_max_mb', '100', 'integer', 'Tamaño máximo archivo MB', 'contenidos', true, true),
('contenidos.formatos_video', 'mp4,avi,mov,webm', 'string', 'Formatos de video permitidos', 'contenidos', true, true),
('contenidos.formatos_imagen', 'jpg,jpeg,png,gif,webp', 'string', 'Formatos de imagen permitidos', 'contenidos', true, true),
('campanas.duracion_min_dias', '1', 'integer', 'Duración mínima campaña días', 'campanas', true, true),
('campanas.requiere_aprobacion', 'true', 'boolean', 'Campañas requieren aprobación', 'campanas', true, true),
('notificaciones.habilitadas', 'true', 'boolean', 'Notificaciones habilitadas', 'notificaciones', true, true),
('email.servidor_smtp', 'smtp.gmail.com', 'string', 'Servidor SMTP', 'email', true, true),
('email.puerto', '587', 'integer', 'Puerto SMTP', 'email', true, true),
('email.remitente', 'noreply@innoad.com', 'string', 'Email remitente', 'email', true, true),
('dispositivos.ping_intervalo_seg', '300', 'integer', 'Intervalo de ping dispositivos', 'dispositivos', true, true),
('dispositivos.alerta_temperatura', '70', 'integer', 'Temperatura máxima antes de alerta', 'dispositivos', true, true)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO plantillas_email (codigo, nombre, asunto, cuerpo_html, variables, categoria) VALUES
('bienvenida', 'Email de Bienvenida', 'Bienvenido a InnoAd', 
'<h1>Bienvenido {{nombre_completo}}</h1><p>Tu cuenta ha sido creada exitosamente.</p>', 
ARRAY['nombre_completo', 'nombre_usuario'], 'usuarios'),

('recuperacion_password', 'Recuperación de Contraseña', 'Recupera tu contraseña', 
'<h1>Hola {{nombre_completo}}</h1><p>Usa este código para recuperar tu contraseña: <strong>{{token}}</strong></p>', 
ARRAY['nombre_completo', 'token'], 'seguridad'),

('verificacion_email', 'Verificación de Email', 'Verifica tu email', 
'<h1>Hola {{nombre_completo}}</h1><p>Haz clic en el enlace para verificar tu email: {{url}}</p>', 
ARRAY['nombre_completo', 'url'], 'seguridad'),

('campana_aprobada', 'Campaña Aprobada', 'Tu campaña ha sido aprobada', 
'<h1>Campaña Aprobada</h1><p>Tu campaña "{{campana_nombre}}" ha sido aprobada y está lista para publicarse.</p>', 
ARRAY['nombre_completo', 'campana_nombre'], 'campanas'),

('factura_generada', 'Nueva Factura', 'Nueva factura generada', 
'<h1>Factura #{{numero_factura}}</h1><p>Se ha generado una nueva factura por un total de {{total}} {{moneda}}.</p>', 
ARRAY['numero_factura', 'total', 'moneda'], 'facturas')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO plantillas_notificacion (codigo, titulo, contenido, tipo, categoria, variables) VALUES
('campana_creada', 'Nueva Campaña', 'Se creó la campaña "{{campana_nombre}}"', 'info', 'campanas', ARRAY['campana_nombre']),
('contenido_aprobado', 'Contenido Aprobado', 'Tu contenido "{{contenido_nombre}}" fue aprobado', 'success', 'contenidos', ARRAY['contenido_nombre']),
('dispositivo_offline', 'Dispositivo Offline', 'El dispositivo {{dispositivo_codigo}} está desconectado', 'warning', 'dispositivos', ARRAY['dispositivo_codigo']),
('tarea_asignada', 'Nueva Tarea', 'Se te asignó la tarea "{{tarea_titulo}}"', 'info', 'tareas', ARRAY['tarea_titulo']),
('reunion_proxima', 'Reunión Próxima', 'Reunión "{{reunion_titulo}}" en {{minutos}} minutos', 'warning', 'reuniones', ARRAY['reunion_titulo', 'minutos'])
ON CONFLICT (codigo) DO NOTHING;

CREATE OR REPLACE VIEW vista_usuarios_roles AS
SELECT 
    u.id,
    u.nombre_usuario,
    u.email,
    u.nombre_completo,
    u.activo,
    u.verificado,
    u.ultimo_acceso,
    r.nombre AS rol_nombre,
    r.descripcion AS rol_descripcion
FROM usuarios u
LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
LEFT JOIN roles r ON ur.rol_id = r.id;

CREATE OR REPLACE VIEW vista_campanas_estadisticas AS
SELECT 
    c.id,
    c.nombre,
    c.descripcion,
    c.fecha_inicio,
    c.fecha_fin,
    c.estado,
    c.presupuesto,
    c.gasto_actual,
    c.roi,
    u.nombre_completo AS creador,
    cat.nombre AS categoria,
    COUNT(DISTINCT cp.pantalla_id) AS total_pantallas,
    COUNT(DISTINCT cc.contenido_id) AS total_contenidos,
    COALESCE(SUM(e.impresiones), 0) AS total_impresiones,
    COALESCE(AVG(e.engagement_rate), 0) AS engagement_promedio
FROM campanas c
LEFT JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN categorias_campana cat ON c.categoria_id = cat.id
LEFT JOIN campana_pantallas cp ON c.id = cp.campana_id
LEFT JOIN campana_contenidos cc ON c.id = cc.campana_id
LEFT JOIN estadisticas e ON c.id = e.campana_id
GROUP BY c.id, c.nombre, c.descripcion, c.fecha_inicio, c.fecha_fin, 
         c.estado, c.presupuesto, c.gasto_actual, c.roi, u.nombre_completo, cat.nombre;

CREATE OR REPLACE VIEW vista_dispositivos_salud AS
SELECT 
    d.id,
    d.codigo_dispositivo,
    d.nombre,
    d.modelo,
    d.estado,
    p.nombre AS pantalla_nombre,
    u.nombre AS ubicacion_nombre,
    m.temperatura,
    m.uso_cpu,
    m.uso_memoria,
    m.uso_disco,
    m.estado_red,
    m.fecha_registro AS ultima_metrica,
    CASE 
        WHEN m.temperatura > 70 THEN 'critico'
        WHEN m.temperatura > 60 THEN 'advertencia'
        ELSE 'normal'
    END AS estado_salud
FROM dispositivos_raspberry d
LEFT JOIN pantallas p ON d.id = p.dispositivo_id
LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id
LEFT JOIN LATERAL (
    SELECT * FROM metricas_dispositivos 
    WHERE dispositivo_id = d.id 
    ORDER BY fecha_registro DESC 
    LIMIT 1
) m ON true;

CREATE OR REPLACE VIEW vista_facturacion_cliente AS
SELECT 
    c.id,
    c.razon_social,
    c.email,
    c.estado AS estado_cliente,
    COUNT(DISTINCT f.id) AS total_facturas,
    COUNT(DISTINCT CASE WHEN f.estado = 'pendiente' THEN f.id END) AS facturas_pendientes,
    COUNT(DISTINCT CASE WHEN f.estado = 'pagada' THEN f.id END) AS facturas_pagadas,
    COALESCE(SUM(CASE WHEN f.estado = 'pendiente' THEN f.total ELSE 0 END), 0) AS monto_pendiente,
    COALESCE(SUM(CASE WHEN f.estado = 'pagada' THEN f.total ELSE 0 END), 0) AS monto_pagado,
    COALESCE(SUM(f.total), 0) AS monto_total
FROM clientes c
LEFT JOIN facturas f ON c.id = f.cliente_id
GROUP BY c.id, c.razon_social, c.email, c.estado;

CREATE OR REPLACE VIEW vista_pantallas_ubicacion AS
SELECT 
    p.id,
    p.codigo_unico,
    p.nombre,
    p.tipo,
    p.resolucion,
    p.estado,
    u.nombre AS ubicacion,
    u.ciudad,
    u.pais,
    u.trafico_estimado,
    d.codigo_dispositivo,
    d.estado AS estado_dispositivo,
    COUNT(DISTINCT pg.grupo_id) AS total_grupos
FROM pantallas p
LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id
LEFT JOIN dispositivos_raspberry d ON p.dispositivo_id = d.id
LEFT JOIN pantalla_grupos pg ON p.id = pg.pantalla_id
GROUP BY p.id, p.codigo_unico, p.nombre, p.tipo, p.resolucion, p.estado,
         u.nombre, u.ciudad, u.pais, u.trafico_estimado, d.codigo_dispositivo, d.estado;

CREATE OR REPLACE VIEW vista_tareas_pendientes AS
SELECT 
    t.id,
    t.titulo,
    t.tipo,
    t.prioridad,
    t.estado,
    t.fecha_vencimiento,
    t.progreso,
    asignado.nombre_completo AS asignado_a,
    creador.nombre_completo AS creado_por,
    c.nombre AS campana,
    COUNT(DISTINCT ct.id) AS total_comentarios,
    CASE 
        WHEN t.fecha_vencimiento < CURRENT_DATE THEN 'vencida'
        WHEN t.fecha_vencimiento <= CURRENT_DATE + INTERVAL '3 days' THEN 'proxima'
        ELSE 'normal'
    END AS urgencia
FROM tareas t
LEFT JOIN usuarios asignado ON t.asignado_a = asignado.id
LEFT JOIN usuarios creador ON t.creado_por = creador.id
LEFT JOIN campanas c ON t.campana_id = c.id
LEFT JOIN comentarios_tarea ct ON t.id = ct.tarea_id
WHERE t.estado != 'completada'
GROUP BY t.id, t.titulo, t.tipo, t.prioridad, t.estado, t.fecha_vencimiento, 
         t.progreso, asignado.nombre_completo, creador.nombre_completo, c.nombre;

-- ============================================================
-- FASE 2: Sistema de Alertas en Tiempo Real
-- ============================================================

CREATE TABLE IF NOT EXISTS alertas_sistema (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL DEFAULT 'INFO',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVA',
    origen VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    usuario_resolucion VARCHAR(100),
    descripcion_resolucion TEXT,
    detalles JSONB,
    prioridad INTEGER DEFAULT 3,
    dispositivo_id VARCHAR(100),
    usuario_id VARCHAR(100),
    notificado_a_usuario BOOLEAN DEFAULT FALSE,
    fecha_notificacion TIMESTAMP,
    CONSTRAINT chk_tipo CHECK (tipo IN ('CRITICA', 'ADVERTENCIA', 'INFO', 'EXITO')),
    CONSTRAINT chk_estado CHECK (estado IN ('ACTIVA', 'RESUELTA', 'IGNORADA', 'ESCALADA', 'EN_INVESTIGACION')),
    CONSTRAINT chk_prioridad CHECK (prioridad >= 1 AND prioridad <= 5)
);

CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_sistema(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_sistema(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo_estado ON alertas_sistema(tipo, estado);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridad ON alertas_sistema(prioridad DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_fecha_creacion ON alertas_sistema(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_dispositivo_id ON alertas_sistema(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_alertas_usuario_id ON alertas_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_origen ON alertas_sistema(origen);

CREATE TABLE IF NOT EXISTS auditoria_alertas (
    id BIGSERIAL PRIMARY KEY,
    alerta_id BIGINT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    usuario_id VARCHAR(100) NOT NULL,
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detalles JSONB,
    CONSTRAINT fk_auditoria_alerta FOREIGN KEY (alerta_id) 
        REFERENCES alertas_sistema(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auditoria_alerta_id ON auditoria_alertas(alerta_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria_alertas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_alertas(fecha_accion DESC);

CREATE TABLE IF NOT EXISTS plantillas_alertas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    titulo_template VARCHAR(255) NOT NULL,
    descripcion_template TEXT,
    prioridad INTEGER DEFAULT 3,
    origen VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plantillas_activo ON plantillas_alertas(activo);
CREATE INDEX IF NOT EXISTS idx_plantillas_tipo ON plantillas_alertas(tipo);

INSERT INTO plantillas_alertas (nombre, tipo, titulo_template, descripcion_template, prioridad, origen)
VALUES
    ('Fallo de Conexión', 'CRITICA', 'Fallo de conexión en dispositivo {{dispositivo}}', 
     'No se pudo establecer conexión con el dispositivo {{dispositivo}}. Verifique el estado del dispositivo.', 4, 'RaspberryPi'),
    ('Batería Baja', 'ADVERTENCIA', 'Batería baja en {{dispositivo}}', 
     'El nivel de batería del dispositivo {{dispositivo}} está por debajo del 20%.', 3, 'RaspberryPi'),
    ('Espacio Insuficiente', 'ADVERTENCIA', 'Espacio insuficiente en {{dispositivo}}', 
     'El espacio disponible en {{dispositivo}} es inferior al 10% de la capacidad total.', 3, 'Sistema'),
    ('CPU Alta', 'ADVERTENCIA', 'Uso de CPU alto en {{dispositivo}}', 
     'El uso de CPU en {{dispositivo}} está por encima del 80%.', 2, 'Sistema'),
    ('Memoria Insuficiente', 'CRITICA', 'Memoria insuficiente en {{dispositivo}}', 
     'El uso de memoria en {{dispositivo}} está por encima del 95%.', 5, 'Sistema'),
    ('Actualización Completada', 'EXITO', 'Actualización completada en {{dispositivo}}', 
     'La actualización de {{dispositivo}} se completó exitosamente.', 1, 'Sistema'),
    ('Prueba del Sistema', 'INFO', 'Prueba de conectividad', 
     'Se ejecutó una prueba de conectividad del sistema exitosamente.', 1, 'Sistema')
ON CONFLICT (nombre) DO NOTHING;

CREATE OR REPLACE FUNCTION registrar_cambio_alerta()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_alertas (alerta_id, accion, usuario_id, detalles)
        VALUES (
            NEW.id,
            CASE 
                WHEN NEW.estado != OLD.estado THEN 'CAMBIO_ESTADO'
                WHEN NEW.prioridad != OLD.prioridad THEN 'CAMBIO_PRIORIDAD'
                ELSE 'ACTUALIZAR'
            END,
            COALESCE(NEW.usuario_resolucion, 'SISTEMA'),
            jsonb_build_object(
                'antes', jsonb_build_object('estado', OLD.estado, 'prioridad', OLD.prioridad),
                'despues', jsonb_build_object('estado', NEW.estado, 'prioridad', NEW.prioridad)
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_alertas ON alertas_sistema;
CREATE TRIGGER trigger_auditoria_alertas
AFTER UPDATE ON alertas_sistema
FOR EACH ROW
EXECUTE FUNCTION registrar_cambio_alerta();

CREATE OR REPLACE VIEW vista_alertas_activas AS
SELECT 
    id,
    tipo,
    titulo,
    descripcion,
    estado,
    origen,
    fecha_creacion,
    prioridad,
    dispositivo_id,
    usuario_id
FROM alertas_sistema
WHERE estado = 'ACTIVA'
ORDER BY prioridad DESC, fecha_creacion DESC;

CREATE OR REPLACE VIEW vista_alertas_criticas AS
SELECT 
    id,
    tipo,
    titulo,
    descripcion,
    estado,
    origen,
    fecha_creacion,
    prioridad,
    dispositivo_id,
    usuario_id
FROM alertas_sistema
WHERE estado = 'ACTIVA' AND prioridad >= 4
ORDER BY prioridad DESC, fecha_creacion DESC;

CREATE OR REPLACE VIEW vista_estadisticas_alertas AS
SELECT 
    COUNT(*) as total_alertas,
    SUM(CASE WHEN estado = 'ACTIVA' THEN 1 ELSE 0 END) as alertas_activas,
    SUM(CASE WHEN estado = 'RESUELTA' THEN 1 ELSE 0 END) as alertas_resueltas,
    SUM(CASE WHEN tipo = 'CRITICA' AND estado = 'ACTIVA' THEN 1 ELSE 0 END) as criticas_activas,
    SUM(CASE WHEN tipo = 'ADVERTENCIA' AND estado = 'ACTIVA' THEN 1 ELSE 0 END) as advertencias_activas,
    AVG(CASE WHEN estado = 'RESUELTA' THEN 
        EXTRACT(EPOCH FROM (fecha_resolucion - fecha_creacion)) / 60 ELSE NULL END) as tiempo_promedio_resolucion_minutos
FROM alertas_sistema;

COMMIT;


