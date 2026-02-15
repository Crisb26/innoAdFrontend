# Ejecutar Migraciones de Base de Datos

## IMPORTANTE: Ejecutar ANTES de iniciar el servidor

Las migraciones crean las tablas necesarias para que el sistema funcione correctamente.

## Opción 1: Usando psql (Recomendado)

### En Windows:
```bash
# Abre una terminal en la carpeta BACKEND
cd BACKEND

# Ejecuta el script SQL
psql -h localhost -U innoad_user -d innoad_db -f DATABASE-MIGRATIONS.sql
```

### En Linux/Mac:
```bash
psql -h localhost -U innoad_user -d innoad_db -f DATABASE-MIGRATIONS.sql
```

## Opción 2: Usando pgAdmin

1. Abre pgAdmin en tu navegador (http://localhost:5050)
2. Conéctate al servidor PostgreSQL
3. Selecciona la base de datos `innoad_db`
4. Abre la herramienta SQL (Query Tool)
5. Copia y pega el contenido de `DATABASE-MIGRATIONS.sql`
6. Haz clic en "Execute"

## Opción 3: Ejecutar desde Docker

Si estás usando Docker Compose:

```bash
# Copiar el script a la BD
docker cp BACKEND/DATABASE-MIGRATIONS.sql $(docker-compose ps -q db):/tmp/

# Ejecutar dentro del contenedor
docker-compose exec db psql -U innoad_user -d innoad_db -f /tmp/DATABASE-MIGRATIONS.sql
```

## Verificar que las migraciones se ejecutaron correctamente

Ejecuta esto en psql o pgAdmin:

```sql
-- Ver todas las tablas
\dt

-- Debería mostrar:
-- campanas
-- campana_contenidos
-- campana_pantallas
-- campana_tags
-- chats
-- mensajes_chat
-- presencia_usuarios
-- reportes
-- estadisticas_campanas
-- (y otras tablas existentes)

-- Ver estructura de una tabla
\d campanas

-- Ver índices
\di
```

## Si algo sale mal

### Error: "tabla ya existe"
Es normal si ya ejecutaste el script antes. El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlo múltiples veces.

### Error: "usuario no encontrado"
Asegúrate de tener creado el usuario `innoad_user` con contraseña `innoad_password`:

```sql
CREATE USER innoad_user WITH PASSWORD 'innoad_password';
ALTER ROLE innoad_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE innoad_db TO innoad_user;
```

### Error: "base de datos no existe"
Crea la BD primero:

```bash
createdb -U postgres innoad_db
```

## Próximos pasos

Después de ejecutar las migraciones:

1. Inicia el servidor backend:
   ```bash
   mvn spring-boot:run
   ```

2. Verifica en los logs que aparece:
   ```
   Application started successfully
   ```

3. El sistema ahora podrá:
   - ✅ Crear/editar/eliminar campañas
   - ✅ Crear chats entre usuarios y técnicos
   - ✅ Almacenar estadísticas
   - ✅ Guardar datos correctamente en la BD

---

**Fecha creación:** 2026-02-15
**Versión:** 1.0
