# 🐳 INSTRUCCIONES PARA KEVIN - DESPLIEGUE DOCKER

## 👋 Hola Kevin,

Cris ha compilado exitosamente el backend. Ahora necesitas hacer lo siguiente para subir la imagen a Azure:

---

## 📋 PASOS EXACTOS

### **PASO 1: Actualizar código local**
```bash
cd C:\Users\[TU_USER]\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
git pull origin main
```

### **PASO 2: Construir imagen Docker**
```bash
docker build -t innoad-backend:latest .
```

**Salida esperada:**
```
✅ Successfully tagged innoad-backend:latest
```

---

### **PASO 3: Etiquetar imagen para Azure Container Registry**
```bash
docker tag innoad-backend:latest InnoAdRegistry.azurecr.io/innoad-backend:latest
```

---

### **PASO 4: Autenticarse en Azure Container Registry**
```bash
az login
az acr login --name InnoAdRegistry
```

**Si pide contraseña/token:**
- Usa tus credenciales de Azure
- O usa Personal Access Token de Azure DevOps

---

### **PASO 5: Subir imagen a Azure**
```bash
docker push InnoAdRegistry.azurecr.io/innoad-backend:latest
```

**Espera a que termine 100%:**
```
✅ Pushing image innoad-backend:latest to registry
✅ Successfully pushed to InnoAdRegistry
```

---

### **PASO 6: Actualizar Container App en Azure**
```bash
az containerapp update \
  --name innoad-backend \
  --resource-group innoad-rg \
  --image InnoAdRegistry.azurecr.io/innoad-backend:latest
```

---

## ✅ VERIFICACIÓN - Comando para comprobar que todo funciona

```bash
# Ver estado del container app
az containerapp show --name innoad-backend --resource-group innoad-rg --query properties.provisioningState

# Debería mostrar: "Succeeded"
```

---

## 🔧 Si algo falla

### **Error: "Could not resolve host"**
```bash
az login  # Vuelve a autenticarte
```

### **Error: "Unauthorized: authentication required"**
```bash
az acr login --name InnoAdRegistry  # Vuelve a hacer login en el registro
```

### **Error: "image not found"**
Asegúrate de estar en la carpeta correcta:
```bash
cd C:\Users\[TU_USER]\Desktop\PROYECTO FINAL INNOAD\BACKEND\innoadBackend
```

---

## 📞 Contacta a Cris si necesitas ayuda

**Tiempo estimado:** 5-10 minutos  
**Complejidad:** ⭐⭐ (Bajo)

---

**Última actualización:** 30 de noviembre de 2025
