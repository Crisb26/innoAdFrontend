# InnoAd Frontend# InnoAd FrontendINNOAD - SISTEMA DE PUBLICIDAD DIGITAL# INNOAD# InnoAd Frontend



Sistema de gestión de publicidad digital para pantallas LED conectadas.



## 📋 DescripciónAplicacion web para la gestion de campanas publicitarias en pantallas digitales.



Frontend desarrollado en Angular para la plataforma InnoAd. Aplicación web progresiva que permite gestionar campañas publicitarias, contenidos multimedia, pantallas digitales y analizar estadísticas en tiempo real. Optimizado para soportar más de 2000 usuarios concurrentes con asistente de inteligencia artificial integrado.



## 🚀 Tecnologías## Descripcion



- **Angular** 18.2.14

- **TypeScript** 5.5.4

- **RxJS** 7.8.2Frontend desarrollado en Angular para la plataforma InnoAd. Sistema integral de gestion de publicidad digital que permite crear contenidos multimedia, programar campanas, administrar pantallas y analizar estadisticas en tiempo real.DESCRIPCION

- **Bootstrap** 5.3.2

- **Chart.js** 4.4.7

- **Leaflet** 1.9.4

## TecnologiasSistema de Gestion de Publicidad Digital para pantallas LEDSistema de Gestion de Publicidad Digital - Interfaz de Usuario

## 📦 Requisitos Previos



- Node.js 20.18.0 LTS o superior

- npm 11.6.0 o superior- Angular 18.2.14Sistema web para gestion de campanas publicitarias en pantallas digitales con tecnologia Angular y Spring Boot

- Angular CLI 18.2.12

- PostgreSQL 16 (para el backend)- TypeScript 5.5.4



## 🔧 Instalación- RxJS 7.8.2



1. **Clonar el repositorio**- Bootstrap 5.3.2

```bash

git clone https://github.com/Crisb26/innoAdFrontend.git- Chart.js 4.4.7

cd innoadFrontend

```- Leaflet 1.9.4



2. **Instalar dependencias**TECNOLOGIAS## Descripcion## DESCRIPCION

```bash

npm install## Requisitos Previos

```



3. **Configurar variables de entorno**

- Node.js 20.18.0 LTS o superior

Revisar y ajustar archivos en `src/environments/` según el entorno:

- `environment.ts` - Desarrollo- npm 11.6.0 o superiorFrontend:

- `environment.prod.ts` - Producción

- `environment.compose.ts` - Docker Compose- Angular CLI 18.2.12



4. **Iniciar servidor de desarrollo**Angular 18.2.14

```bash

npm start## Instalacion

```

TypeScript 5.5.4InnoAd es una plataforma completa para gestionar campañas publicitarias en pantallas digitales. Permite crear contenidos multimedia, programar campañas, administrar pantallas y analizar estadisticas en tiempo real.Frontend desarrollado en Angular para la plataforma InnoAd. Aplicacion web progresiva para la gestion y control de publicidad digital en pantallas conectadas.

La aplicación estará disponible en `http://localhost:4200`

1. Clonar el repositorio

## 📜 Scripts Disponibles

Bootstrap 5.3.2

| Comando | Descripción |

|---------|-------------|```bash

| `npm start` | Inicia servidor de desarrollo con proxy |

| `npm run build` | Construcción para producción |git clone https://github.com/Crisb26/innoAdFrontend.gitRxJS 7.8.2

| `npm run build:prod` | Build optimizado para producción |

| `npm test` | Ejecuta pruebas unitarias |cd innoadFrontend

| `npm run lint` | Verifica calidad del código |

```

## 📂 Estructura del Proyecto



```

src/2. Instalar dependenciasBackend:El sistema esta optimizado para soportar mas de 2000 usuarios concurrentes y incluye un asistente de inteligencia artificial para ayudar en la creacion de campañas.## TECNOLOGIAS

├── app/

│   ├── core/

│   │   ├── config/          - Configuraciones globales

│   │   ├── guards/          - Guardias de ruta (autenticación, permisos)```bashSpring Boot 3.5.7

│   │   ├── interceptores/   - Interceptores HTTP (auth, error)

│   │   ├── modelos/         - Modelos de datos TypeScriptnpm install

│   │   └── servicios/       - Servicios compartidos (API, autenticación)

│   ├── modulos/```Java 21

│   │   ├── admin/           - Administración de usuarios y sistema

│   │   ├── asistente-ia/    - Asistente inteligente

│   │   ├── autenticacion/   - Login, registro, recuperación

│   │   ├── campanas/        - Gestión de campañas publicitarias3. Configurar variables de entornoPostgreSQL 16

│   │   ├── contenidos/      - Gestión de multimedia

│   │   ├── dashboard/       - Panel principal con métricas

│   │   ├── pantallas/       - Control de pantallas digitales

│   │   ├── player/          - Reproductor digitalRevisar archivos en `src/environments/` y ajustar segun el entorno.Maven 3.9.11## Tecnologias- Angular 19

│   │   └── reportes/        - Estadísticas y reportes

│   └── shared/

│       └── componentes/     - Componentes reutilizables

├── assets/                  - Recursos estáticos (iconos, imágenes, videos)4. Iniciar servidor de desarrollo

└── environments/            - Configuraciones de entorno

```



## 🔗 Configuración del Backend```bashBase de Datos:- TypeScript 5.7



El frontend requiere el backend de InnoAd ejecutándose en `http://localhost:8080`npm start



**Repositorio del backend:** [innoadBackend](https://github.com/Crisb26/innoadBackend)```PostgreSQL 16



### Configuración de Proxy



El proyecto incluye configuración de proxy en `proxy.conf.json` para desarrollo local:La aplicacion estara disponible en `http://localhost:4200`Puerto 5432Backend - Spring Boot 3.5.7 con Java 21- NgRx para gestion de estado



```json

{

  "/api": {## Scripts DisponiblesBase: innoad_db

    "target": "http://localhost:8080",

    "secure": false,

    "changeOrigin": true

  }- `npm start` - Inicia servidor de desarrollo con proxyUsuario: postgresFrontend - Angular 18.2.14 con TypeScript 5.5.4- NgBootstrap

}

```- `npm run build` - Construccion para produccion



## 👤 Credenciales de Acceso- `npm test` - Ejecuta pruebas unitariasPassword: Cris930226**



Usuario de prueba:- `npm run lint` - Verifica calidad del codigo

- **Usuario:** `admin`

- **Contraseña:** `Admin123!`Base de Datos - PostgreSQL 16- Chart.js



## ✨ Funcionalidades Principales## Estructura del Proyecto



### 📊 Gestión de Campañas

- Creación y edición de campañas publicitarias

- Programación temporal```

- Asignación de contenidos y pantallas

- Control de presupuestosrc/REQUISITOSCache - Redis (opcional)- Leaflet



### 🎨 Gestión de Contenidos├── app/

- Carga de imágenes y videos

- Vista previa de multimedia│   ├── core/

- Organización por categorías

- Aprobación de contenidos│   │   ├── config/          - Configuraciones globales



### 📺 Control de Pantallas│   │   ├── guards/          - Guardias de rutaNode.js 20.18.0Contenedores - Docker y Docker Compose- RxJS

- Registro de pantallas digitales

- Monitoreo en tiempo real│   │   ├── interceptores/   - Interceptores HTTP

- Geolocalización

- Estados y estadísticas│   │   ├── modelos/         - Modelos de datosnpm 11.6.0



### 📈 Reportes y Estadísticas│   │   └── servicios/       - Servicios compartidos

- Dashboard interactivo

- Gráficos de impresiones│   ├── modulos/Java 21

- Métricas por campaña

- Exportación de datos│   │   ├── admin/           - Administracion de usuarios



### 🤖 Asistente IA│   │   ├── asistente-ia/    - Asistente inteligenteMaven 3.9.11

- Ayuda inteligente para creación de campañas

- Sugerencias de optimización│   │   ├── autenticacion/   - Login y registro

- Análisis de contenidos

│   │   ├── campanas/        - Gestion de campanasPostgreSQL 16## Requisitos## REQUISITOS DEL SISTEMA

## 🏗️ Compilación para Producción

│   │   ├── contenidos/      - Gestion de multimedia

```bash

npm run build│   │   ├── dashboard/       - Panel principal

```

│   │   ├── pantallas/       - Control de dispositivos

Los archivos compilados se generan en el directorio `dist/`

│   │   ├── player/          - Reproductor digital

### Despliegue

│   │   └── reportes/        - Estadisticas y metricas

La aplicación puede desplegarse en:

- Servidores web estáticos (Nginx, Apache)│   └── shared/INSTALACION

- Plataformas cloud (Vercel, Netlify, AWS S3)

- Contenedores Docker│       └── componentes/     - Componentes reutilizables



## 🐳 Docker├── assets/                  - Recursos estaticosJava 21 o superior- Node.js 20.18 LTS o superior



El proyecto incluye soporte para Docker Compose:└── environments/            - Configuraciones de entorno



```bash```1. Crear base de datos

# Construir imágenes

docker-compose build



# Iniciar servicios## Configuracion del Backend   Ejecutar DATABASE-SCRIPT.sql en PostgreSQLNode.js 20.x o superior- npm 10.8.2 o superior

docker-compose up -d



# Detener servicios

docker-compose downEl frontend requiere el backend de InnoAd ejecutandose en `http://localhost:8080`

```



## 🔒 Características Técnicas

Repositorio del backend: [innoadBackend](https://github.com/Crisb26/innoadBackend)2. BackendPostgreSQL 16- Angular CLI 19

- ✅ Arquitectura modular basada en feature modules

- ✅ Lazy loading para optimización de carga

- ✅ Guards para protección de rutas

- ✅ Interceptores HTTP para manejo de tokens JWT## Credenciales de Acceso   cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend

- ✅ Servicios centralizados para comunicación con API

- ✅ Manejo de estado reactivo con RxJS

- ✅ Responsive design con Bootstrap

- ✅ Gráficos interactivos con Chart.jsUsuario de prueba:   mvn clean package -DskipTestsMaven 3.9.x

- ✅ Mapas con Leaflet

- ✅ API Gateway preparado para migración a microservicios



## 🌐 Compatibilidad- Usuario: `admin`   java -jar target/innoad-backend-2.0.0.jar --server.port=8080



- Chrome 90+- Contrasena: `Admin123!`

- Firefox 88+

- Safari 14+Git## INSTALACION

- Edge 90+

## Funcionalidades Principales

## 📊 Capacidad

3. Frontend

El sistema está optimizado para:

- 2000+ usuarios concurrentes### Gestion de Campanas

- Bundle frontend de 145KB comprimido

- 25 módulos con lazy loading- Creacion y edicion de campanas publicitarias   cd c:\Users\bueno\Desktop\PROYECTO FINAL INNOAD\FRONTEND\innoadFrontend

- Cache y compresión activada

- Programacion temporal

## 🔐 Seguridad

- Asignacion de contenidos y pantallas   npm install

- Autenticación JWT con tokens de acceso y refresh

- Encriptación BCrypt para passwords- Control de presupuesto

- CORS configurado para dominios permitidos

- Headers de seguridad CSP y XSS protection   npm start## Instalacion Rapida1. Clonar el repositorio

- Logs de auditoría completos

### Gestion de Contenidos

## 📄 Licencia

- Carga de imagenes y videos

Proyecto privado - Todos los derechos reservados

Copyright 2025 InnoAd - ADSO 2994283- Vista previa de multimedia



## 👨‍💻 Autor- Organizacion por categorias4. Acceso2. Instalar dependencias: npm install



**Cristian Bueno** - Desarrollo Full Stack- Aprobacion de contenidos



## 📧 Contacto   http://localhost:4200



- **Email:** cris930226@gmail.com### Control de Pantallas

- **GitHub:** [Crisb26](https://github.com/Crisb26)

- **Repositorio:** [innoAdFrontend](https://github.com/Crisb26/innoAdFrontend)- Registro de pantallas digitalesClonar el repositorio3. Configurar variables de entorno segun environment


- Monitoreo en tiempo real

- Geolocalizacion

- Estados y estadisticas

CREDENCIALES4. Ejecutar en desarrollo: npm start

### Reportes y Estadisticas

- Dashboard interactivo

- Graficos de impresiones

- Metricas por campanaadmin / Admin123! - Administrador completo```

- Exportacion de datos

tecnico / Tecnico123! - Tecnico configuracion

### Asistente IA

- Ayuda inteligente para creacion de campanasdev / Dev123! - Desarrollador herramientasgit clone https://github.com/Crisb26/innoAdFrontend.gitLa aplicacion estara disponible en http://localhost:4200

- Sugerencias de optimizacion

- Analisis de contenidosusuario / Usuario123! - Usuario estandar



## Compilacion para Produccioncd innoadFrontend



```bash

npm run build

```ESTRUCTURA```## SCRIPTS DISPONIBLES



Los archivos compilados se generan en el directorio `dist/`



## Configuracion de Proxysrc/



El proyecto incluye configuracion de proxy en `proxy.conf.json` para desarrollo local:  app/



```json    core/ - Servicios, modelos, interceptores, guardsCrear la base de datos- npm start - Inicia servidor de desarrollo

{

  "/api": {    modulos/ - Modulos funcionales (campanas, contenidos, pantallas, etc)

    "target": "http://localhost:8080",

    "secure": false,    shared/ - Componentes compartidos- npm run build - Construccion para produccion

    "changeOrigin": true

  }

}

```Abrir PostgreSQL y ejecutar el archivo DATABASE-SCRIPT.sql que contiene todo el esquema completo con datos iniciales.- npm run build:prod - Build optimizado para produccion



## Caracteristicas TecnicasMODULOS



- Arquitectura modular basada en feature modules- npm test - Ejecuta pruebas unitarias

- Lazy loading para optimizacion de carga

- Guards para proteccion de rutasAutenticacion - Login y registro

- Interceptores HTTP para manejo de tokens JWT

- Servicios centralizados para comunicacion con APIDashboard - Panel principal```- npm run lint - Analisis de codigo estatico

- Manejo de estado reactivo con RxJS

- Responsive design con BootstrapCampanas - Gestion de campanas publicitarias

- Graficos interactivos con Chart.js

- Mapas con LeafletContenidos - Gestion de multimediapsql -U postgres



## CompatibilidadPantallas - Control de dispositivos



- Chrome 90+Reportes - Estadisticas y metricas\i DATABASE-SCRIPT.sql## FUNCIONALIDADES PRINCIPALES

- Firefox 88+

- Safari 14+Admin - Administracion de usuarios

- Edge 90+

Asistente IA - Ayuda inteligente```

## Licencia



Este proyecto es privado y confidencial.

- Autenticacion y autorizacion de usuarios

## Autor

CONFIGURACION

Cristian Bueno

Iniciar el sistema- Dashboard con metricas en tiempo real

## Contacto

Desarrollo:

Para consultas o soporte:

- Email: cristianbueno@innoad.com- API: http://localhost:8080/api/v1- Gestion de pantallas Raspberry Pi

- Repositorio: https://github.com/Crisb26/innoAdFrontend

- Puerto: 4200

- Proxy: proxy.conf.jsonEjecutar el archivo INICIAR.bat que inicia automaticamente el backend y frontend.- Gestion de contenidos multimedia



Produccion:- Sistema de campanas publicitarias

- Compilar: ng build

- Carpeta: dist/innoad-frontend```- Perfil de usuario y configuracion



INICIAR.bat- Reportes y estadisticas

SCRIPTS

```

npm start - Iniciar desarrollo

npm run build - Compilar produccion## ESTRUCTURA DEL PROYECTO

npm test - Ejecutar pruebas

npm run lint - Verificar codigoEl sistema estara disponible en http://localhost:4200



```

DESARROLLO

## Credenciales por Defectosrc/

Backend primero en puerto 8080

Luego frontend en puerto 4200├── app/

Login con usuarios de prueba

Administrador│   ├── core/          - Servicios y modelos compartidos



API DOCSUsuario: admin│   ├── modulos/       - Modulos funcionales de la aplicacion



http://localhost:8080/swagger-ui.htmlPassword: Admin123!│   └── shared/        - Componentes y utilidades compartidas



├── assets/            - Recursos estaticos

CAPACIDAD

Gestor└── environments/      - Configuraciones de entorno

2000 usuarios simultaneos

Optimizado con lazy loadingUsuario: gestor```

Cache y compresion activada

Password: Gestor123!



REPOSITORIO## CONSTRUCCION PARA PRODUCCION



https://github.com/Crisb26/innoAdFrontend## Estructura del Proyecto



npm run build:prod

CONTACTO

```

Cristian Bueno

cristianbueno@innoad.comFRONTEND/Los archivos generados se almacenan en dist/innoad-frontend


  innoadFrontend/

    src/## DESPLIEGUE

      app/

        core/              Servicios, guards, interceptoresLa aplicacion puede desplegarse en cualquier servidor web estatico (Nginx, Apache) o plataformas cloud (Vercel, Netlify, AWS S3).

        modulos/           Componentes organizados por funcionalidad

        shared/            Componentes compartidos## CONFIGURACION DE ENTORNO

    INICIAR.bat           Script para iniciar todo el sistema

    DATABASE-SCRIPT.sql   Script completo de base de datosAjustar las variables en src/environments/ segun el entorno:



BACKEND/- environment.ts - Desarrollo

  innoadBackend/- environment.prod.ts - Produccion

    src/

      main/## LICENCIA

        java/

          com/innoad/Copyright 2025 InnoAd - ADSO 2994283

            configuracion/     Configuracion de seguridad y CORS
            controladores/     Endpoints REST API
            servicios/         Logica de negocio
            repositorios/      Acceso a datos
            entidades/         Modelos de base de datos
```

## Modulos Principales

Autenticacion - Login, registro y gestion de sesiones con JWT
Dashboard - Panel principal con metricas en tiempo real
Campañas - Creacion y gestion de campañas publicitarias
Contenidos - Subida y administracion de archivos multimedia
Pantallas - Control de pantallas LED distribuidas geograficamente
Estadisticas - Reportes y analisis de impresiones
Asistente IA - Ayuda inteligente para crear campañas efectivas
Administracion - Gestion de usuarios, roles y permisos

## Configuracion

Todas las configuraciones del backend estan en application.yml

Base de datos: localhost:5432/innoad_db
Usuario: postgres
Password: Cris930226**

Para cambiar la configuracion editar el archivo src/main/resources/application.yml en el backend.

## Scripts Disponibles

INICIAR.bat - Inicia backend y frontend automaticamente
DATABASE-SCRIPT.sql - Crea la base de datos completa
docker-compose.yml - Inicia el sistema completo con Docker

## Desarrollo

Iniciar backend
```
cd BACKEND/innoadBackend
mvn spring-boot:run
```

Iniciar frontend
```
cd FRONTEND/innoadFrontend
npm start
```

El frontend estara en http://localhost:4200
El backend estara en http://localhost:8080

## Compilacion para Produccion

Frontend
```
cd FRONTEND/innoadFrontend
npm run construir
```

Los archivos compilados estaran en dist/innoad-frontend/browser/

Backend
```
cd BACKEND/innoadBackend
mvn clean package
```

El archivo JAR estara en target/innoad-backend-2.0.0.jar

## Docker

Construir imagenes
```
docker-compose build
```

Iniciar servicios
```
docker-compose up -d
```

Detener servicios
```
docker-compose down
```

## API Documentation

Una vez iniciado el backend, la documentacion interactiva de la API esta disponible en:

http://localhost:8080/swagger-ui.html

## Monitoreo

El backend incluye endpoints de monitoreo en:

http://localhost:8080/actuator/health - Estado del sistema
http://localhost:8080/actuator/metrics - Metricas detalladas

## Seguridad

El sistema implementa:

- Autenticacion JWT con tokens de acceso y refresh
- Encriptacion BCrypt para passwords
- Rate limiting para prevenir ataques
- CORS configurado para dominios permitidos
- Headers de seguridad CSP y XSS protection
- Logs de auditoria completos

## Capacidad

El sistema esta optimizado para:

- 2000+ usuarios concurrentes
- 100 peticiones por segundo al API
- Pool de conexiones de 100 a la base de datos
- Bundle frontend de solo 145KB comprimido
- 25 modulos con lazy loading

## Licencia

Proyecto privado - Todos los derechos reservados

## Autores

Cristian Bueno - Desarrollo Full Stack

## Contacto

Email: cris930226@gmail.com
GitHub: https://github.com/Crisb26
