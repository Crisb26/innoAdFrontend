-- ========================================================
-- FIX: REPARAR CUENTA ADMIN - InnoAd
-- Ejecutar en PostgreSQL para resolver problemas de login
-- ========================================================

-- 1. VERIFICAR ESTADO ACTUAL DEL ADMIN
SELECT id, nombre_usuario, rol, contrasena, activo, verificado,
       intentos_fallidos, fecha_bloqueo
FROM usuarios
WHERE nombre_usuario = 'admin';

-- 2. LIMPIAR INTENTOS FALLIDOS Y DESBLOQUEAR
UPDATE usuarios
SET intentos_fallidos = 0,
    fecha_bloqueo = NULL
WHERE nombre_usuario = 'admin';

-- 3. ASEGURAR QUE ADMIN ESTÁ ACTIVO Y VERIFICADO
UPDATE usuarios
SET activo = true,
    verificado = true
WHERE nombre_usuario = 'admin';

-- 4. VERIFICAR QUE EL ROL ES CORRECTO (ADMIN no ADMINISTRADOR)
UPDATE usuarios
SET rol = 'ADMIN'
WHERE nombre_usuario = 'admin' AND rol != 'ADMIN';

-- 5. VERIFICAR ESTADO FINAL
SELECT id, nombre_usuario, rol, activo, verificado,
       intentos_fallidos, fecha_bloqueo
FROM usuarios
WHERE nombre_usuario = 'admin';

-- 6. COMPARAR CON OTROS USUARIOS FUNCIONALES
SELECT nombre_usuario, rol, activo, verificado, intentos_fallidos, fecha_bloqueo
FROM usuarios
WHERE nombre_usuario IN ('admin', 'tecnico', 'usuario')
ORDER BY nombre_usuario;

-- COMMIT;
