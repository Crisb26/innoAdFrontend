# FEATURES A IMPLEMENTAR - INNOAD

## PRIORIDAD 1: SOLUCIONAR ERROR 404

**Problema**: Nginx no redirige `/api/` al backend

**Solución**:
1. En servidor, reemplazar `/etc/nginx/sites-enabled/default` con contenido de `nginx-config.conf`
2. Ejecutar: `sudo systemctl reload nginx`
3. Probar: `curl http://100.91.23.46/api/v1/auth/status`

---

## PRIORIDAD 2: UPLOAD DE FOTOS DE PERFIL

### Backend - Crear archivo:
`BACKEND/src/main/java/com/innoad/modules/profile/service/ServicioPerfil.java`

```java
@Service
@RequiredArgsConstructor
public class ServicioPerfil {
    private final UsuarioRepository usuarioRepository;
    private final String UPLOAD_DIR = "/var/uploads/perfil/";

    public void cambiarFotoPerfil(MultipartFile file) {
        Usuario usuario = obtenerUsuarioActual();

        // Validar archivo
        if (!file.getContentType().startsWith("image/")) {
            throw new BadRequestException("Solo se permiten imágenes");
        }
        if (file.getSize() > 5242880) { // 5MB
            throw new BadRequestException("Archivo demasiado grande");
        }

        // Guardar archivo
        String nombreArchivo = usuario.getId() + "_" + System.currentTimeMillis() + ".jpg";
        String ruta = UPLOAD_DIR + nombreArchivo;

        try {
            file.transferTo(new File(ruta));
            usuario.setFotoPerfil("/uploads/perfil/" + nombreArchivo);
            usuarioRepository.save(usuario);
        } catch (IOException e) {
            throw new InternalServerException("Error al guardar foto");
        }
    }
}
```

### Frontend - Actualizar component:
`FRONTEND/innoadFrontend/src/app/components/profile/profile.component.ts`

```typescript
export class ProfileComponent {
    constructor(private profileService: ProfileService) {}

    cambiarFoto(event: any) {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        this.profileService.cambiarFoto(formData).subscribe(
            response => alert('Foto actualizada'),
            error => alert('Error: ' + error)
        );
    }
}
```

### Nginx - Permitir acceso a uploads:
```nginx
location /uploads/ {
    alias /var/uploads/;
    expires 30d;
}
```

---

## PRIORIDAD 3: CREACIÓN DE USUARIOS Y EMAIL DE VERIFICACIÓN

### Backend Service:
`BACKEND/src/main/java/com/innoad/modules/auth/service/ServicioCorreo.java`

```java
@Service
@RequiredArgsConstructor
public class ServicioCorreo {
    private final JavaMailSender mailSender;

    public void enviarCorreoVerificacion(String email, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(email);
        mensaje.setSubject("Verifica tu correo - InnoAd");
        mensaje.setText(
            "Hola,\n\n" +
            "Para completar tu registro, haz clic aquí:\n" +
            "https://azure-pro.tail2a2f73.ts.net/verify-email?token=" + token +
            "\n\nEste enlace expira en 24 horas."
        );
        mailSender.send(mensaje);
    }

    public void enviarCorreoRecuperacion(String email, String token) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(email);
        mensaje.setSubject("Recupera tu contraseña - InnoAd");
        mensaje.setText(
            "Hola,\n\n" +
            "Para cambiar tu contraseña, haz clic aquí:\n" +
            "https://azure-pro.tail2a2f73.ts.net/reset-password?token=" + token +
            "\n\nEste enlace expira en 1 hora."
        );
        mailSender.send(mensaje);
    }
}
```

### application-server.yml - Configurar email:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: tu-email@gmail.com
    password: tu-contraseña-app
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

---

## PRIORIDAD 4: UPLOAD DE CONTENIDO (PUBLICIDAD, VIDEOS)

### Backend Controller:
`BACKEND/src/main/java/com/innoad/modules/upload/controller/ControladorUpload.java`

```java
@RestController
@RequestMapping("/api/v1/upload")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'USUARIO')")
public class ControladorUpload {
    private final ServicioUpload servicioUpload;

    @PostMapping("/publicidad")
    public ResponseEntity<UploadResponse> subirPublicidad(
            @RequestParam("file") MultipartFile file,
            @RequestParam("titulo") String titulo) {
        UploadResponse response = servicioUpload.guardarPublicidad(file, titulo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/video")
    public ResponseEntity<UploadResponse> subirVideo(
            @RequestParam("file") MultipartFile file) {
        UploadResponse response = servicioUpload.guardarVideo(file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/contenido/{id}")
    public ResponseEntity<byte[]> descargarContenido(@PathVariable Long id) {
        byte[] contenido = servicioUpload.obtenerContenido(id);
        return ResponseEntity.ok()
            .header("Content-Type", "application/octet-stream")
            .body(contenido);
    }
}
```

### Base de datos:
```sql
CREATE TABLE contenido (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(255),
    tipo VARCHAR(50), -- 'VIDEO', 'IMAGEN', 'PDF'
    ruta_archivo VARCHAR(500),
    tamanio_bytes BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campana (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255),
    contenido_id INTEGER REFERENCES contenido(id),
    estado VARCHAR(50), -- 'ACTIVA', 'PAUSA', 'FINALIZADA'
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## PRIORIDAD 5: INTEGRACIÓN DE PAGOS

### PayPal Integration:
`BACKEND/src/main/java/com/innoad/modules/pagos/service/ServicioPayPal.java`

```java
@Service
@RequiredArgsConstructor
public class ServicioPayPal {
    private final PayPalHttpClient payPalClient;

    public String crearOrdenPago(PagoRequest request) {
        Order order = new Order();
        order.intent("CAPTURE");

        PurchaseUnitRequest puRequest = new PurchaseUnitRequest();
        puRequest.amountWithBreakdown(new AmountWithBreakdown()
            .currencyCode("USD")
            .value(String.valueOf(request.getMonto())));

        order.purchaseUnits(Arrays.asList(puRequest));

        OrdersCreateRequest orderRequest = new OrdersCreateRequest();
        orderRequest.header("prefer", "return=representation");
        orderRequest.body(order);

        try {
            HttpResponse<Order> response = payPalClient.client().execute(orderRequest);
            return response.result().id();
        } catch (IOException e) {
            throw new PaymentException("Error creando orden PayPal");
        }
    }
}
```

### PSE (Plataforma Segura Electronica):
```java
@Service
public class ServicioPSE {

    public String crearTransaccionPSE(PagoRequest request) {
        // PSE requiere credentials específicos
        String referencia = "REF" + System.currentTimeMillis();

        // Endpoint PSE: POST /api/PSE/CreateTransaction
        // Response: URL de redirección para usuario

        return pseService.createTransaction(
            request.getMonto(),
            request.getEmail(),
            referencia
        );
    }
}
```

### Bancos Colombianos (ACH/ACE):
```sql
CREATE TABLE banco (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    codigo VARCHAR(10),
    habilitado BOOLEAN DEFAULT true
);

INSERT INTO banco (nombre, codigo) VALUES
('Davivienda', '006'),
('Banco de Bogotá', '012'),
('Banco de América', '023'),
('Banorte', '009'),
('BBVA Colombia', '013'),
('Scotiabank', '078'),
('Itaú', '060'),
('Banco Santander', '081'),
('NU Colombia', '810');
```

---

## PRIORIDAD 6: DESCARGA EN PDF

### Backend Service:
`BACKEND/src/main/java/com/innoad/modules/reportes/service/ExportadorPDF.java`

```java
@Service
@RequiredArgsConstructor
public class ExportadorPDF {

    public byte[] generarReporteUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();

        Document documento = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(documento, out);

        documento.open();
        documento.add(new Paragraph("REPORTE INNOAD - " + usuario.getNombreCompleto()));
        documento.add(new Paragraph("Fecha: " + LocalDate.now()));
        documento.add(new Paragraph("Email: " + usuario.getEmail()));

        // Agregar datos
        PdfPTable tabla = new PdfPTable(3);
        tabla.addCell("Campana");
        tabla.addCell("Estado");
        tabla.addCell("Fecha");

        List<Campana> campanas = campanaRepository.findByUsuarioId(usuarioId);
        for (Campana c : campanas) {
            tabla.addCell(c.getTitulo());
            tabla.addCell(c.getEstado());
            tabla.addCell(c.getFechaCreacion().toString());
        }

        documento.add(tabla);
        documento.close();

        return out.toByteArray();
    }
}
```

### Frontend - Descargar:
```typescript
descargarReporte() {
    this.reportService.generarPDF().subscribe(
        (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte.pdf';
            a.click();
        }
    );
}
```

---

## PRIORIDAD 7: VISUALIZACIÓN EN RASPBERRY PI

### Raspberry Pi Sync Service:
```java
@Service
@Scheduled(fixedRate = 5000) // Sincronizar cada 5 segundos
public class ServicioSincronizacionRaspberry {

    public List<ContenidoParaPantalla> obtenerContenidoActual(String codigoPantalla) {
        Pantalla pantalla = pantallaRepository.findByCodigoRaspberry(codigoPantalla);

        if (pantalla == null) {
            return Collections.emptyList();
        }

        Campana campanaActiva = campanaRepository.findActivaByPantalla(pantalla.getId());

        if (campanaActiva == null) {
            return Collections.emptyList();
        }

        return campanaActiva.getContenidos().stream()
            .map(c -> new ContenidoParaPantalla(
                c.getId(),
                c.getRutaArchivo(),
                c.getTipo(),
                campanaActiva.getDuracionSegundos()
            ))
            .collect(Collectors.toList());
    }
}
```

### Endpoint para Raspberry:
```java
@GetMapping("/api/v1/raspberry/{codigo}/contenido")
public ResponseEntity<List<ContenidoParaPantalla>> obtenerContenido(
        @PathVariable String codigo) {
    List<ContenidoParaPantalla> contenido = servicioRaspberry.obtenerContenidoActual(codigo);
    return ResponseEntity.ok(contenido);
}
```

---

## PASO A PASO PARA IMPLEMENTAR

### 1. Solucionar Nginx (HOY)
```bash
# En servidor
sudo cp /ruta/nginx-config.conf /etc/nginx/sites-available/default
sudo systemctl reload nginx
curl http://100.91.23.46/api/v1/auth/status  # Debe devolver 200
```

### 2. Crear carpeta de uploads
```bash
sudo mkdir -p /var/uploads/perfil
sudo mkdir -p /var/uploads/publicidad
sudo mkdir -p /var/uploads/videos
sudo chmod -R 755 /var/uploads
```

### 3. Actualizar Backend (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<dependency>
    <groupId>com.lowagie</groupId>
    <artifactId>itext</artifactId>
    <version>4.2.0</version>
</dependency>
```

### 4. Compilar y desplegar
```bash
cd BACKEND
mvn clean package -DskipTests
systemctl restart innoad-backend
```

### 5. Compilar Frontend
```bash
cd FRONTEND/innoadFrontend
npm run build
cp -r dist/* /var/www/innoad/
```

### 6. Hacer push a GitHub
```bash
git add .
git commit -m "feat: upload de fotos, email verificación, pagos y reportes"
git push origin main
```

---

## VERIFICACIÓN FINAL

```bash
# 1. Test upload foto
curl -X POST http://100.91.23.46/api/v1/profile/foto \
  -F "file=@foto.jpg"

# 2. Test email
curl -X POST http://100.91.23.46/api/v1/auth/registrarse \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","contrasena":"Pass123!"}'

# 3. Verificar directorio uploads
ls -la /var/uploads/

# 4. Test API Gateway
curl http://100.91.23.46/api/v1/auth/status
```
