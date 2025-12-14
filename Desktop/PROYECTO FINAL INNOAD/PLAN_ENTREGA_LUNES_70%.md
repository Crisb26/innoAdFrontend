# 🚀 PLAN EJECUTIVO - ENTREGA LUNES (70%) + VERSIÓN MOBILE

**Fecha:** 13 Diciembre 2025  
**Entrega:** Lunes (70% del aplicativo)  
**Defensa:** Abril 2026  
**Objetivo:** Sistema completo + impresión con versión mobile

---

## 📋 CHECKLIST LUNES - 70% DEL APLICATIVO

### ✅ DEBE ESTAR HECHO

```
BACKEND (Spring Boot):
☐ Autenticación JWT completa (login/register/logout)
☐ CRUD Pantallas con orientación (HORIZONTAL/VERTICAL)
☐ CRUD Contenidos (imagen, video, texto, HTML)
☐ CRUD Campañas/Publicaciones
☐ Gestión de Usuarios (roles: ADMIN, USER)
☐ API REST completamente documentada en Swagger
☐ WebSocket para actualizaciones en tiempo real
☐ Validación de errores HTTP (400, 401, 403, 404, 500)
☐ Base de datos PostgreSQL con todas las tablas
☐ Modo Mantenimiento con clave admin (⚠️ CRÍTICO - VER ABAJO)

FRONTEND (Angular):
☐ Login/Register funcional con JWT
☐ Dashboard con estadísticas básicas
☐ Listar pantallas con orientación (📺 horizontal, 📱 vertical)
☐ Crear/editar pantallas
☐ Listar contenidos
☐ Crear/subir contenidos
☐ Listar campañas
☐ Crear campañas
☐ Panel de administrador (usuarios, roles, permisos)
☐ Modo Mantenimiento (activar/desactivar)
☐ Responsive (desktop + tablet)

RASPBERRY PI:
☐ DisplayManager.py sincronizando contenidos
☐ Reproducción con orientación
☐ Monitoreo de hardware (CPU, RAM, temperatura)
☐ Conexión al backend (HTTP polling)
☐ Logs visibles en dashboard

INTEGRACIONES:
☐ Frontend → Backend HTTP (pantallas, contenidos, campañas)
☐ Frontend → Backend WebSocket (actualizaciones en vivo)
☐ RPi → Backend HTTP (sincronización)
☐ BD ← Backend JDBC (todas operaciones persistidas)

DEPLOYMENT:
☐ Backend en Azure/Railway en vivo
☐ Frontend en Netlify/Vercel en vivo
☐ Dominio de prueba funcionando
☐ SSL/HTTPS activo
☐ Base de datos accesible
```

---

## 🚨 MODO MANTENIMIENTO - CRÍTICO PARA LUNES

Dijiste que estaba creado pero no lo vuelves a ver. Busquemos:

### En Backend, debería existir:

```java
// 1. Entity Pantalla.java - campo mantenimiento
@Column(name = "modo_mantenimiento")
private boolean modoMantenimiento = false;

// 2. ControladorAdmin.java - endpoint para activar modo
@PostMapping("/mantenimiento/activar")
@RequiredArgsConstructor
public ResponseEntity<RespuestaAPI<Void>> activarMantenimiento(
    @RequestBody MantenimientoRequest request,  // Contiene: clave, mensaje
    @AuthenticationPrincipal Usuario usuario
) {
    // Validar que sea ADMIN
    // Validar clave correcta
    // Activar modo en todas las pantallas
    // Enviar notificación WebSocket
    // Retornar 200 OK
}

// 3. ControladorPantalla.java - validación en GET
@GetMapping
public List<PantallaDTO> obtenerPantallas() {
    if (sistemaEnMantenimiento()) {
        return obtenerPantallasConEstadoMantenimiento();
    }
    return obtenerPantallasNormales();
}
```

**Acción:** Buscar estos archivos hoy

---

## 📱 VERSIÓN MOBILE - PROPUESTA

### POR QUÉ AGREGAR VERSIÓN MOBILE PARA LUNES

```
PARA IMPRESIONAR A LOS EVALUADORES:
✅ Frontend (Web) - Visible en navegador
✅ Mobile (Android) - Se ve en celular
✅ Backend - Mismo API (reutilizado)
✅ RPi - En vivo en el estadio

= Sistema MULTIPLATAFORMA = Profesional 🔥
```

### OPCIÓN A: React Native (RECOMENDADA - Tiempo: 2 días)

```typescript
// Misma lógica del frontend, código diferente
// JavaScript/TypeScript = Ya saben

Estructura:
innoadMobile/
├─ android/              (Auto-generado)
│  └─ app/
│     └─ build.gradle    (Para compilar APK)
├─ ios/                  (Ignorar - no pagar Apple)
├─ src/
│  ├─ screens/
│  │  ├─ LoginScreen.tsx
│  │  ├─ PantallasScreen.tsx
│  │  ├─ ContenidosScreen.tsx
│  │  ├─ AdminScreen.tsx
│  │  └─ MantenimientoScreen.tsx
│  ├─ services/
│  │  └─ api.ts          (Reutilizar lógica del web)
│  ├─ components/
│  └─ App.tsx
└─ app.json

// Reutiliza 80% de la lógica del web
// Cambiar solo la UI (Componentes React Native vs Angular)
// Backend = EXACTAMENTE IGUAL
```

### OPCIÓN B: Flutter (MEJOR PERFORMANCE - Tiempo: 3 días)

```dart
// UI mejor, performance nativa
// Lenguaje Dart (aprenderían)

innoadFlutter/
├─ android/              (Auto-generado)
├─ lib/
│  ├─ screens/
│  ├─ services/          (HTTP al mismo backend)
│  ├─ widgets/
│  └─ main.dart
└─ pubspec.yaml
```

### OPCIÓN C: Android Nativo (NO RECOMENDADO - Tiempo: 1 semana)

```kotlin
// Performance máximo
// Pero lenguaje nuevo (Kotlin)
// Mucho más código

innoadAndroid/
├─ app/src/
│  ├─ main/java/
│  │  └─ com/innoad/
│  │     ├─ ui/
│  │     ├─ data/
│  │     └─ domain/
│  └─ res/
└─ build.gradle
```

---

## 🎯 PLAN PARA EL LUNES (48 HORAS)

### VIERNES HOY
```
16:00 - 17:00: Checklist del 70% existente
  □ ¿Backend está en Azure? ¿Funciona?
  □ ¿Frontend está en Netlify? ¿Funciona?
  □ ¿RPi está sincronizado? ¿Se ve en dashboard?
  □ ¿Modo Mantenimiento existe?

17:00 - 19:00: Buscar modo Mantenimiento
  □ Buscar en Backend: ControladorAdmin.java
  □ Buscar en Frontend: AdminComponent.ts
  □ Si existe: Conectarlo
  □ Si no existe: Crearlo (1 hora)

19:00 - 21:00: Testing manual
  □ Crear pantalla → aparece en lista → RPi la recibe
  □ Cambiar orientación → RPi reproduce correctamente
  □ Crear contenido → asignarlo a pantalla → verificar
  □ Activar modo mantenimiento → todas las pantallas se apagan

Dormir bien (necesitarás)
```

### SÁBADO
```
08:00 - 12:00: Completar lo que falta del 70%
  □ Terminar endpoints pendientes
  □ Conectar servicios faltantes
  □ Testing exhaustivo

12:00 - 14:00: Documentación para entrega
  □ Crear PDF con screenshots
  □ Escribir guía de uso
  □ Incluir credenciales de prueba

14:00 - 18:00: Versión mobile (OPCIONAL pero IMPACTANTE)
  □ Opción A: React Native (2 horas de setup)
  □ Opción B: Flutter (3 horas de setup)
  □ Build APK para Android
  □ Instalar en 1-2 celulares de prueba

18:00 - 20:00: Testing mobile
  □ Login desde celular
  □ Ver pantallas
  □ Ver contenidos
  □ Cambiar orientación
  □ Modo mantenimiento

20:00 - 22:00: Preparar presentación para lunes
  □ Diapositivas con flujo
  □ Screenshots de web + mobile
  □ Demos en vivo preparadas
```

### DOMINGO
```
10:00 - 12:00: Testing final del 100%
  □ Web en navegador
  □ Mobile en celular
  □ RPi en vivo
  □ Modo mantenimiento activo
  □ Cambios en tiempo real (WebSocket)

12:00 - 16:00: Preparación para demostración
  □ Scripts de demo memorizados
  □ Crear usuarios de prueba
  □ Preparar datos de ejemplo
  □ Verificar conexión a internet

16:00 - 18:00: Descanso y preparación mental
  □ Revisar diapositivas
  □ Dormir bien
  □ Llegar con 30 min de anticipación

18:00+: LISTO PARA LUNES ✅
```

---

## 🔧 VERSIÓN MOBILE - CÓMO HAREMOS

### PASO 1: Crear proyecto React Native (15 min)

```bash
# En terminal:
npx create-expo-app innoadMobile
cd innoadMobile

# Instalar dependencias
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install axios socket.io-client
npm install expo-secure-store  # Para guardar JWT
```

### PASO 2: Reutilizar servicios (30 min)

```typescript
// innoadMobile/src/services/api.ts
// CASI EXACTO al web, solo cambiar componentes

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://backend.innoad.com/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor JWT (IDÉNTICO al web)
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const pantallasService = {
  obtener: () => apiClient.get('/pantallas'),
  crear: (data) => apiClient.post('/pantallas', data),
  actualizar: (id, data) => apiClient.put(`/pantallas/${id}`, data),
};

export const contenidosService = {
  obtener: () => apiClient.get('/contenidos'),
  crear: (data) => apiClient.post('/contenidos', data),
};

// ... Exactamente igual al web
```

### PASO 3: Crear pantallas (45 min)

```typescript
// innoadMobile/src/screens/LoginScreen.tsx
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { apiClient } from '../services/api';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      // Guardar token
      await AsyncStorage.setItem('jwt_token', response.data.datos.token);
      
      // Navegar a pantallas
      navigation.navigate('Pantallas');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <TouchableOpacity
        onPress={handleLogin}
        style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### PASO 4: Build APK para Android (15 min)

```bash
# Generar APK firmado
npm install expo-cli
expo build:android --release-channel production

# O más simple:
eas build --platform android --type apk

# Descargar APK y instalar en celular:
adb install app.apk
```

---

## 📊 ARQUITECTURA MOBILE

```
┌─────────────────────────────────────┐
│    FRONTEND MULTIPLATAFORMA         │
├─────────────────────────────────────┤
│  Web (Angular)  │  Mobile (React Native)
│  localhost:4200 │  APK en Android
│  Netlify        │  Google Play (post-grado)
│  ✅ Desktop     │  ✅ Celular
│  ✅ Tablet      │  ✅ Tablet
└─────────────────────────────────────┘
              ↓↓↓
         HTTP/REST + WebSocket
              ↓↓↓
┌─────────────────────────────────────┐
│   Backend (Spring Boot)             │
│   https://backend.innoad.com        │
│   (EXACTAMENTE IGUAL para web+mobile)
└─────────────────────────────────────┘
              ↓↓↓
┌─────────────────────────────────────┐
│   PostgreSQL                        │
│   (Una sola BD para todos)          │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST DELIVERY LUNES

### Para presentar al profesor:

```
📋 ENTREGA (En carpeta zip):

1. CÓDIGO
   ☐ Backend (GitHub link o ZIP)
   ☐ Frontend (GitHub link o ZIP)
   ☐ Mobile APK (para probar en celular)

2. DOCUMENTACIÓN
   ☐ README.md con instrucciones
   ☐ API documentation (Swagger)
   ☐ Diagrama de arquitectura
   ☐ Guía de uso (con screenshots)
   ☐ Credenciales de prueba

3. DEPLOYMENT
   ☐ URL Backend en vivo (Azure/Railway)
   ☐ URL Frontend en vivo (Netlify/Vercel)
   ☐ Base de datos con datos de prueba
   ☐ RPi conectado y sincronizado

4. DEMO PREPARADA
   ☐ Crear usuario → Loguear → Ver dashboard
   ☐ Crear pantalla → Cambiar orientación
   ☐ Crear contenido → Asignar a pantalla
   ☐ Modo mantenimiento → Activar/desactivar
   ☐ WebSocket → Cambios en tiempo real
   ☐ Mobile → Loguear desde celular

5. PRESENTACIÓN
   ☐ Diapositivas con flujo del sistema
   ☐ Explicar arquitectura
   ☐ Mostrar web + mobile
   ☐ Demostración en vivo
```

---

## 🎁 BONUS PARA IMPRESIONAR

Si logras todo lo anterior, agrega:

```
+ Vista de RPi en dashboard (CPU, RAM, temperatura)
+ Notificaciones en tiempo real (WebSocket)
+ Estadísticas de reproducción
+ Filtros y búsqueda avanzada
+ Dark mode en móvil
+ Exportar reportes en PDF
+ Historial de cambios
+ Sistema de logs
+ API GraphQL (bonus avanzado)
```

---

## 💰 INFRAESTRUCTURA PARA LUNES

```
BACKEND:
├─ Railway ($7/mes) o Azure Free Tier ✅ YA EXISTE
├─ PostgreSQL en Neon ✅ YA EXISTE
└─ Dominio: innoadbackend.com (free con Netlify)

FRONTEND:
├─ Netlify Free ✅ YA EXISTE
├─ Dominio: innoadapp.com
└─ SSL: Auto (gratis con Netlify)

MOBILE:
├─ React Native (Gratis, SDK Android)
├─ Expo (Gratis, para testear)
├─ APK local (Instalar en celular)
└─ Google Play (Post-grado, $25 una vez)

RASPBERRY PI:
├─ Hardware físico ✅ YA EXISTE
├─ Python + OMXPlayer ✅ YA EXISTE
└─ Conexión a Backend ✅ YA EXISTE

TOTAL LUNES: $0 (ya está todo pagado)
```

---

## 🚨 RIESGOS Y SOLUCIONES

| Riesgo | Probabilidad | Solución |
|--------|------------|----------|
| **No encuentras Modo Mantenimiento** | Media | Crearlo hoy (1-2 horas) |
| **Backend no actualiza en vivo** | Baja | Testing + recheck WebSocket |
| **Mobile no compila** | Media | Usar Flutter en lugar de React Native |
| **RPi no sincroniza** | Baja | Verificar conexión + logs |
| **Falta tiempo** | Alta | Enfocarse en 70% sin mobile |
| **Evaluadores piden lo que no existe** | Alta | Mostrar documentación + roadmap |

---

## 📞 SOPORTE TÉCNICO DURANTE EL PLAN

Si te trancas en:

```
BACKEND:
→ Buscar en pom.xml si Spring Boot Security está configurado
→ Verificar application.yml para DB connection
→ Usar logs: docker logs backend

FRONTEND:
→ Abrir DevTools (F12) → Console
→ Buscar errores HTTP 401, 403, 500
→ Verificar localStorage → jwt_token existe

MOBILE:
→ npx react-native doctor (verifica setup)
→ Android Studio → Device Manager (emulador)
→ Usar expo-dev-client para debugging

RPi:
→ ssh pi@raspberry.local
→ python3 displaymanager.py (ejecutar)
→ Ver logs en /var/log/innoad/
```

---

## 🏆 EXPECTATIVA VS REALIDAD

### REALIDAD LUNES (70%)
```
✅ Sistema web completo
✅ Backend en vivo
✅ BD funcionando
✅ RPi sincronizado
✅ Modo mantenimiento
❌ Mobile (demasiado tiempo)

CALIFICACIÓN ESPERADA: 7/10
```

### BONUS CON MOBILE
```
✅ Sistema web completo
✅ Backend en vivo
✅ BD funcionando
✅ RPi sincronizado
✅ Modo mantenimiento
✅ APK Android funcionando

CALIFICACIÓN ESPERADA: 9-10/10 ⭐⭐⭐
```

---

## 🎯 DECISION FINAL

### OPCIÓN 1: Solo 70% (SEGURO)
- ✅ Web + Backend + RPi funcionando
- ✅ Sin riesgo de no terminar
- ✅ Tiempo para dormir
- ❌ Mobile para abril

**RECOMENDACIÓN:** Si estás cansado o algo no funciona

### OPCIÓN 2: 70% + Mobile (AMBICIOSO)
- ✅ Web + Backend + RPi + Mobile
- ✅ Impresiona mucho más
- ⚠️ Dormir menos
- ✅ Terminado para lunes

**RECOMENDACIÓN:** Si tienes energía y quieres destacar

---

## 📅 PRÓXIMA SEMANA

### DESPUÉS DEL LUNES:

```
Semana de Abril (Defensa Final):

Task 13: Optimizaciones
  □ Performance (caché, índices BD)
  □ Escalabilidad (arquitectura)
  □ Seguridad (penetration testing)

Task 14: Funcionalidades Avanzadas
  □ Analytics y reportes
  □ Exportar PDF
  □ Integración pagos (si aplica)
  □ Notificaciones push

Task 15: Pulishing
  □ Google Play Store
  □ Sitio web profesional
  □ Documentación técnica
  □ Código limpio y comentado
```

---

**¿DECIDIDO? Sí quieres que empecemos ahora mismo, dame 30 minutos y:**

1. Diagnostico del 70% existente
2. Plan exacto para Modo Mantenimiento
3. Scaffold de React Native listo para usar

**¿O esperas a mañana para empezar?**

El tiempo es el recurso más valioso. Mejor empezamos YA. 🚀
