-- Cambiar contraseña de usuario postgres
ALTER USER postgres WITH PASSWORD 'postgres123';

-- Verificar que el cambio fue exitoso
SELECT 'Contraseña de postgres cambiada a: postgres123' as confirmacion;
