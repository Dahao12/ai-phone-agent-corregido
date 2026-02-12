# Correcciones AI Phone Agent - 2026-02-12

## 🔴 Problema Encontrado: Llamadas Entrantes en lugar de Salientes

### Causa Raíz
El usuario estaba usando el parámetro `sip: '100'` en las llamadas Zadarma.

### ¿Qué pasaba?
```javascript
// ❌ INCORRECTO - Causa llamada ENTRANTE al PBX
{
  from: '34936941917',
  to: '34610243061',
  sip: '100',     // ← ¡Problema! Extensión interna del PBX
  predicted: 1
}
```

**Resultado:**
- Zadarma llama a la extensión 100 del PBX
- El teléfono conectado a extensión 100 RECIBE la llamada como **ENTRANTE** ❌
- La llamada no se dirige hacia afuera al número destino

---

## ✅ Solución Aplicada

### Opción A: Llamada Saliente Directa (Recomendado)
```javascript
// ✅ CORRECTO - LLamada SALIENTE directa
{
  from: '34936941917',   // Tu número de salida de Zadarma
  to: '34610243061',     // Destino a llamar
  predicted: 1
  // ❌ NO incluir 'sip'
}
```

**Resultado:**
- Zadarma llama directamente al número destino
- Es una **LLAMADA SALIENTE** ✓
- Sin extensiones internas del PBX

---

## 📦 Archivos Modificados/Creados

### 1. test-llamada-saliente-correcta.js (NUEVO)
**Propósito:** Prueba de llamada saliente directa
**Uso:**
```bash
node test-llamada-saliente-correcta.js
```

**Funciones:**
- `verifyBalance()` - Verificar saldo Zadarma
- `testSalidaDirecta()` - Probar llamada saliente sin parámetro 'sip'

---

### 2. call-batch-correcto.js (NUEVO)
**Propósito:** Llamadas masivas CORREGIDAS con sistema de CACHE

**Correcciones:**
1. ✅ Quitó parámetro `sip` de las llamadas
2. ✅ Integró sistema de cache `ClientCache`
3. ✅ Filtra clientes ya procesados
4. ✅ Muestra estadísticas detalladas
5. ✅ Guarda progreso automáticamente

**Uso:**
```bash
node call-batch-correcto.js
```

**Funcionamiento:**
1. Carga clientes del CSV
2. Filtra contra el cache (evita duplicados)
3. Llama solo a clientes pendientes
4. Guarda progreso en `cache/state.json`
5. Muestra estadísticas al final

---

## 🗂 Sistema de CACHE Integrado

### Funciones del Cache
- `client-cache.js` almacenado en `src/cache/client-cache.js` ✓

**Uso:**
```javascript
const ClientCache = require('./src/cache/client-cache');
const cache = new ClientCache();

// Verificar
cache.printStats();           // Mostrar estadísticas
cache.getPending();           // Obtener pendientes
cache.getProcessedIds();      // IDs procesados

// Actualizar
cache.set(id, client);        // Agregar al cache
cache.updateStatus(id, 'Called', {...});
cache.saveState();            // Guardar en disco
```

---

## 📋 Checklist de Implementación en Windows

### Paso 1: Transferir archivos
```
Desde Mac:
- test-llamada-saliente-correcta.js
- call-batch-correcto.js
- src/cache/client-cache.js

Hacia Windows:
- C:\ai-phone-agent\
```

### Paso 2: Prueba simple
```bash
# En Windows PowerShell/CMD
cd C:\ai-phone-agent
node test-llamada-saliente-correcta.js
```

**Verificar:**
- ¿La llamada llega como SALIENTE? ✓
- ¿Tu móvil recibe la llamada del número Zadarma? ✓

### Paso 3: Procesar lote de clientes
```bash
node call-batch-correcto.js
```

**Qué hace:**
- ✅ Llama solo a clientes pendientes
- ✅ No duplica llamadas
- ✅ Guarda progreso
- ✅ Puede reiniciar y continuar

---

## ❓ Preguntas Frecuentes

### ¿Por qué no usar el parámetro 'sip'?

El parámetro `sip` es para when quieres que la llamada llegue a una extensión específica del PBX. Ejemplo:
```
sip: '100' → Llamar a extensión 100 del PBX
```

Para llamadas salientes a números externos, NO debes usar `sip`.

### ¿Cómo verificar que es SALIENTE?

1. **Recibes la llamada en tu móvil desde el número Zadarma** → SALIENTE ✓
2. **Tu PBX recibe la llamada como entrante** → Es INCORRECTO ❌

### ¿Qué es el número fromNumber?

Es el número que Zadarma te asignó para hacer llamadas salientes.
- Debe aparecer en tu panel de Zadarma: Numbers → View
- En tu caso: `+34936941917`

### ¿Puedo usar cualquier número como fromNumber?

❌ NO. Solo puedes usar números asignados por Zadarma.

### ¿El cache funciona automáticamente?

Sí. La primera vez llama a TODOS. Después solo llama a NO procesados.

Para reiniciar:
```javascript
cache.clear();  // En el código
// O manual: borra cache/state.json
```

---

## 🎯 Próximos Passos

1. ✅ Probar llamada saliente simple
2. ✅ Verificar que llega correctamente
3. ✅ Procesar pequeño lote (2-3 clientes)
4. ✅ Verificar funcionamiento del cache
5. ✅ Escalar a todos los 1473 clientes

---
Creado: 2026-02-12
Status: Correcciones aplicadas ✓
Prioridad: Probar en Windows
Maintainer: Shide