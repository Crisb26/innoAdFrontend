-- Verificar y corregir rol de admin
-- La restricción CHECK quiere ADMINISTRADOR pero el código requiere ADMIN

-- Ver valores actuales
SELECT nombre_usuario, rol FROM usuarios WHERE nombre_usuario='admin';

-- Cambiar ADMINISTRADOR a ADMIN (si existe la restricción)
-- Primero, necesitamos remover temporalmente la restricción
ALTER TABLE usuarios DROP CONSTRAINT usuarios_rol_check;

-- Ahora cambiar el valor
UPDATE usuarios SET rol='ADMIN' WHERE nombre_usuario='admin' AND rol='ADMINISTRADOR';

-- Agregar nueva restricción con valores válidos
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_rol_check CHECK (rol IN ('ADMIN', 'TECNICO', 'USUARIO'));

-- Verificar resultado
SELECT nombre_usuario, rol FROM usuarios WHERE nombre_usuario IN ('admin', 'tecnico', 'usuario') ORDER BY nombre_usuario;
