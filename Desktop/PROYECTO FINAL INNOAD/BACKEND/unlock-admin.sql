-- DESBLOQUEAR USUARIO ADMIN - InnoAd
-- ====================================

-- VER ESTADO ACTUAL
SELECT 'ESTADO ACTUAL DE USUARIOS:' as estado;
SELECT nombre_usuario, rol, activo, verificado, intentos_fallidos, fecha_bloqueo 
FROM usuarios 
WHERE nombre_usuario IN ('admin', 'tecnico', 'usuario') 
ORDER BY nombre_usuario;

-- DESBLOQUEAR ADMIN
UPDATE usuarios 
SET intentos_fallidos = 0, fecha_bloqueo = NULL, activo = true, verificado = true
WHERE nombre_usuario = 'admin';

-- VER RESULTADO
SELECT '' as espacio;
SELECT 'ADMIN DESBLOQUEADO EXITOSAMENTE!' as resultado;
SELECT nombre_usuario, rol, activo, verificado, intentos_fallidos, fecha_bloqueo 
FROM usuarios 
WHERE nombre_usuario = 'admin';

-- VERIFICAR TODOS LOS USUARIOS
SELECT '' as espacio;
SELECT 'ESTADO FINAL:' as estado;
SELECT nombre_usuario, rol, activo, verificado, intentos_fallidos, fecha_bloqueo 
FROM usuarios 
WHERE nombre_usuario IN ('admin', 'tecnico', 'usuario') 
ORDER BY nombre_usuario;
