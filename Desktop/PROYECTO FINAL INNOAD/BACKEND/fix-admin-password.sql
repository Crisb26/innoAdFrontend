-- Script para corregir usuario admin

-- Actualizar consena admin a Admin123! (con BCrypt)
-- Hash BCrypt de "Admin123!" generado con Spring Security
UPDATE usuarios 
SET contrasena = '$2a$10$aIVbhZJGyHMx8GemHfkK..r7r5nQ5P5V7hjQKR8Vp0GuTXSa1Sqoy'
WHERE nombre_usuario = 'admin';

-- Verificar cambio
SELECT nombre_usuario, rol, activo, intentos_fallidos FROM usuarios WHERE nombre_usuario = 'admin';
