# AI Phone Agent - Enerlux Soluciones

📞 Sistema de llamadas automáticas con Zadarma + Ollama (100% GRATIS)

## 🎯 Qué hace

- Llama automáticamente a clientes desde un archivo CSV
- Usa OLLAMA para conversación con clientes (GRATIS)
- Usa gTTS para voz (GRATIS)
- Sistema de CACHE inteligente
- Reinicia donde se quedó (no duplica llamadas)

## 🚀 Instalación en Windows

### Paso 1: Descargar o clonar

```bash
# Opcion A: Clonar desde GitHub
git clone <repo-url>
cd ai-phone-agent

# Opcion B: Descomprimir ZIP
# Extrae los archivos en: C:\ai-phone-agent\
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar

Edita `config/config.json`:

```json
{
  "zadarma": {
    "apiKey": "TU_API_KEY",
    "secret": "TU_SECRET",
    "fromNumber": "+34936941917"
  },
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "model": "llama3.1:8b"
  }
}
```

🔑 **Credenciales Zadarma:**
- apiKey: Tu API key de Zadarma
- secret: Tu Secret de Zadarma
- fromNumber: Tu número de salida (+34936941917)

---

## 📞 Cómo usar

### Prueba simple (RECOMENDADO primero)

```bash
node test-llamada-saliente-correcta.js
```

Esto llama a tu móvil para verificar que:
- ✅ La configuración es correcta
- ✅ La llamada es SALIENTE (no entrante)
- ✅ Zadarma funciona

### Procesar clientes en lote

```bash
node call-batch-correcto.js
```

**Qué hace:**
1. Carga el archivo `clients.csv`
2. Verifica qué clientes ya fueron llamados (CACHE)
3. Llama solo a pendientes
4. Guarda progreso automáticamente
5. Muestra estadísticas

---

## 💾 Sistema de CACHE

### ¿Qué es?

El cache guarda:
- Qué clientes ya llamaste
- El status de cada llamada
- El dónde paró si reiniciaste

### ¿Dónde se guarda?

```
cache/state.json
```

### Funciones

- `cache.getPending()` - Obtener clientes pendientes
- `cache.getProcessedIds()` - IDs ya procesados
- `cache.printStats()` - Ver estadísticas
- `cache.clear()` - Resetear cache (empezar de cero)

### Reiniciar donde se quedó

```bash
# Automático: vuelve a ejecutar
node call-batch-correcto.js

# Continuará desde donde paró
```

### Empezar de cero (reset completo)

```bash
# Borra el archivo de cache
del cache\state.json

# O manualmente dentro del código: cache.clear()
```

---

## ✅ Correcciones aplicadas (2026-02-12)

### Problema resuelto

**Antes:** Las llamadas llegaban como **ENTRANTE** al PBX ❌

**Causa:** El código usaba parámetro `sip: '100'`

```javascript
// ❌ INCORRECTO
{
  from: '34936941917',
  to: '34610243061',
  sip: '100'  // Causaba llamada entrante
}
```

**Solución:** Quitar parámetro `sip`

```javascript
// ✅ CORRECTO - Llamada SALIENTE
{
  from: '34936941917',
  to: '34610243061'
  // Sin 'sip'
}
```

**Resultado:** Ahora las llamadas son **SALIENTES** ✅

---

## 📊 Estadísticas

El sistema muestra al final:

```
========================================
📊 CACHE STATISTICS
========================================
Total clients:    1473
Processed:       500
Pending:         973
Errors:          0
========================================
```

---

## 📂 Estructura de archivos

```
ai-phone-agent/
├── config/
│   └── config.json          # Configuración
├── src/
│   ├── cache/
│   │   └── client-cache.js  # Sistema de cache
│   ├── ai/
│   │   ├── ollama-integration.js
│   │   └── gtts-integration.js
│   ├── csv/
│   │   └── client-parser.js
│   └── caller/
│       └── zadarma-http-client.js
├── cache/
│   └── state.json           # Guarda progreso (auto-creado)
├── clients.csv              # Lista de clientes
├── test-llamada-saliente-correcta.js  # Prueba simple
├── call-batch-correcto.js              # Procesar lote
├── package.json
└── README.md
```

---

## ⚠️ Importante

### Requisitos

1. **Ollama instalado** (para AI):
   - Descargar: https://ollama.ai
   - Debe estar running: `ollama serve`

2. **FFmpeg instalado** (para TTS):
   - Requerido por gTTS
   - Verificar: `ffmpeg -version`

3. **Node.js instalado**:
   - Versión: v18+ recomendado
   - Verificar: `node --version`

### Zadarma

- **El número fromNumber debe ser asignado por Zadarma**
- Solo puedes usar números que tienes en tu cuenta Zadarma
- Verifica en panel: Numbers → View

---

## 🐛 Solución de problemas

### Error: "Domain not found"
- Verifica que fromNumber es correcto

### Error: "No tiene suficientes fondos"
- Verifica balance Zadarma

### Error: "Ollama not responding"
- Start ollama: `ollama serve`

### Llamadas no salen
- Verifica apiKey y secret en config.json
- Verifica balance Zadarma
- Verifica fromNumber es válido

---

## 📱 Enviar archivo a Windows

### Desde Mac
```bash
# Opción 1: ZIP
zip -r ai-phone-agent.zip ai-phone-agent/
# Manda el zip por WhatsApp

# Opción 2: GitHub
git init
git add .
git commit -m "AI Phone Agent corregido"
git remote add origin https://github.com/[tu-usuario]/ai-phone-agent-fijo.git
git push -u origin main
```

### En Windows
```bash
# Descargar ZIP: descomprimir
# O clonar: git clone <repo-url>

cd C:\ai-phone-agent
npm install
node test-llamada-saliente-correcta.js
```

---

## 📞 Contacto

**Enerlux Soluciones**
- Tel: +34 610 243 061
- Email: enerlux.soluciones@gmail.com

---

**Creado:** 2026-02-12
**Status:** ✅ Corregido y listo para usar
**Author:** Shide (OpenClaw Assistant)