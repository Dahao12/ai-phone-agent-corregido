# AI Phone Agent - Sistema Llamadas Automáticas - INSTRUCCIONES COMPLETAS

## 🎯 Qué hace el sistema

1. **Llama automáticamente** a 1473 clientes desde CSV
2. **Ollama** IA conversa con cada cliente (GRATIS)
3. **gTTS** Voz de IA (GRATIS)
4. **SIP Agent automático** - NO necesitas contestar tú
5. **Systema CACHE** - Reinicia donde se left

---

## 📋 Configuración Zadarma

**Configuración PBX:**
- Extension: 100
- Usuario SIP: 547736-100
- SIP ID: 249312
- Password: hCbud5Y8RS
- Domain: pbx.zadarma.com
- Número público: +34936941917 (CallerID)

**Credenciales API:**
- API Key: e44e9700107ae400f471
- Secret: 8acc083f9511f2ca9c2c

---

## 🚀 Instalación en Windows

### Paso 1: Descargar

**Entra en:**
```
https://github.com/Dahao12/ai-phone-agent-corregido
```

**Click "Code" → "Download ZIP"**

**Descomprimir:** Extract to `C:\ai-phone-agent-corregido-main`

---

### Paso 2: Instalar dependencias

**Abre PowerShell en la carpeta:**

```powershell
cd C:\ai-phone-agent-corregido-main
npm install
```

---

### Paso 3: Verificar config

**Edita:** `config\config.json`

**Verifica que tiene:**
```json
{
  "zadarma": {
    "apiKey": "e44e9700107ae400f471",
    "secret": "8acc083f9511f2ca9c2c",
    "fromNumber": "+34936941917",
    "pbx": {
      "sipId": 249312,
      "extension": "100",
      "user": "547736-100",
      "password": "hCbud5Y8RS",
      "domain": "pbx.zadarma.com"
    }
  },
  "clients": {
    "csvPath": "C:\\ai-phone-agent-corregido-main\\clients.csv"
  }
}
```

---

### Paso 4: Probar LLAMADA UNICA (OBLIGATORIO)

**En PowerShell:**

```powershell
node -e "const {Api} = require('zadarma-api'); new Api('e44e9700107ae400f471', '8acc083f9511f2ca9c2c').call('/v1/pbx/request/call/', { sip: 249312, number: '34610243061' }).then(r => { console.log('R:', r); return new Promise(s => setTimeout(s, 12000)); }).then(()=>console.log('OK')).catch(e=>console.log('E:', e.message))"
```

**Esto hará:**
1. Zadarma inicia llamada hacia tu extensión 100
2. Tu softphone timbra 🔔
3. ✅ **NO CONTESTES** - deja que el softphone llame SOLO
4. Tu móvil recibirá llamada desde +34936941917
5. ✅ **El softphone hablará** automáticamente contigo (Ollama + gTTS)

**Si funciona:** Tu softphone hablará SOLO! 🤖❄️

**Si NO funciona:**
- Verifica tu softphone está ONLINE (🟢 verde)
- Verifica balance Zadarma (0.40 EUR mínimo)
- Verifica extensión 100 está configurada

---

## 🚀 Ejecutar LLAMADAS MASIVAS

**Opción A: Usar script pre-configurado**

```powershell
node call-batch-correcto.js
```

**Este script:**
- ✅ Llama PBX DIRECTA (endpoint /v1/pbx/request/call/)
- ✅ Usa SIP ID 249312
- ✅ Sistema CACHE integrado
- ✅ No duplica llamadas a clientes ya llamados
- ✅ Puede reiniciar donde se left

**Opción B: Usar .BAT file**

```powershell
.\procesar.bat
```

---

## 🤖 Cómo funciona la AUTOMATIZACIÓN

### Flujo completo:

```
1. Node.js inicia llamada
   ↓
2. Zadarma API → Extensión 100 (SIP ID 249312)
   ↓
3. Tu softphone timbra (🔔)
   ↓
4. ❌ NO CONTESTES TÚ
   ↓
5. SIP Agent JS contesta AUTOMATICO
   ↓
6. Softphone llama al cliente
   ↓
7. Cliente responde (o no)
   ↓
8. Ollama (IA) genera respuesta
   ↓
9. gTTS (Texto-a-Voz) convierte a audio
   ↓
10. Softphone habla al cliente
   ↓
11. Cliente responde (audio)
   ↓
12. gTTS (Voz-a-Texto) transcribe
   ↓
13. Ollama genera nueva respuesta
   ↓
14. Loop hasta llamada terminar
```

---

## ⚙ Requisitos PREVIOS

### 1. Ollama instalado y corriendo
```powershell
# Verificar si ollama está corriendo
curl http://localhost:11434
# Debe responder con JSON sobre ollama
```

**Si NO está corriendo:**
```powershell
ollama serve
```

**Deja esta ventana abierta mientras ejecutas el phone agent.**

---

### 2. FFmpeg instalado
```powershell
ffmpeg -version
# Debe mostrar versión y configuración
```

**Si NO está instalado:**
- Descarga: https://ffmpeg.org/download.html
- Instala versión para Windows

---

### 3. Softphone SIP ONLINE

**TU softphone debe estar:**
- 🟢 ONLINE (verde)
- Conectado a la extensión 100
- Listo para recibir llamadas
- ❌ NO necesitas contestar tú

**Softphone puede ser:**
- Zoiper
- X-Lite
- Linphone
- Otro softphone SIP

---

## 📊 Sistema CACHE

**Qué hace:**
- Guarda qué clientes ya llamaron
- Guarda status de cada llamada
- Permite reiniciar donde se left
- Guarda en `cache\state.json`

**Consultas útiles:**
```javascript
cache.printStats()          // Mostrar estadísticas
cache.getPending()          // Obtener pendientes
cache.getProcessedIds()     // IDs ya procesados
cache.clear()              // Resetear todo
```

**Empezar de cero:**
```powershell
del cache\state.json
```

---

## 🔧 Archivos principales

**Configuración:**
- `config\config.json` - Configuración completa

**Scripts de llamadas:**
- `call-batch-correcto.js` - Llamadas masivas CORREGIDAS
- `procesar.bat` - Script .BAT fácil

**Sistema CACHE:**
- `src\cache\client-cache.js` - Sistema cache

**Zadarma:**
- `src\caller\zadarma-http-client.js` - Cliente HTTP Zadarma

**IA:**
- `src\ai\ollama-integration.js` - Ollama (IA GRATIS)
- `src\ai\gtts-integration.js` - gTTS (Voz GRATIS)

**Cliente CSV:**
- `src\csv\client-parser.js` - Parser CSV clientes

---

## 📞 Procedimiento de PRUEBA

### Paso 1: Probar llamada única ✅

```powershell
node -e "const {Api} = require('zadarma-api'); new Api('e44e9700107ae400f471', '8acc083f9511f2ca9c2c').call('/v1/pbx/request/call/', { sip: 249312, number: '34610243061' }).then(r => { console.log('R:', r); return new Promise(s => setTimeout(s, 12000)); }).then(()=>console.log('OK')).catch(e=>console.log('E:', e.message))"
```

Si funciona: Tu móvil recibe llamada desde +34936941917

### Paso 2: Probar lote PEQUEÑO (2-3 clientes)

```powershell
node call-batch-correcto.js
```

Verifica que:
- Softphone responde automáticamente
- Ollama + gTTS funcionan
- Voice se transmite correctamente

### Paso 3: Escalar a TODO (1473 clientes)

```powershell
node call-batch-correcto.js
```

---

## ❓ Solución de problemas

### Error "Not Authorized"
→ Verifica API Key y Secret en config.json

### Error "Wrong method name"
→ Verifica endpoint es `/v1/pbx/request/call/`

### Softphone OFFLINE (gris/rojo)
→ Verifica softphone está conectado a pbx.zadarma.com
→ Verifique usuario: 547736-100
→ Verifique password: hCbud5Y8RS

### Ollama no responde
→ Verifica Ollama está corriendo: `ollama serve`
→ Verifica puerto 11434 está disponible

### No se escucha voz
→ Verifica FFmpeg instalado
→ Verifica gTTS funciona: Prueba solo gTTS

### Softphone no responde automáticamente
→ Verifica SIP Agent JS está corriendo
→ Verifica config SIP en softphone

---

## 🚑 CREDENCIALES ZADARMA

**Panel:** https://pbx.zadarma.com
**Settings → API:**
- API Key: e44e9700107ae400f471
- Secret: 8acc083f9511f2ca9c2c

**Settings → SIP Connections:**
- Extension 100
- User: 547736-100
- Password: hCbud5Y8RS
- Status: ONLINE 🟢

**Numbers → View:**
- +34936941917
- Type: PBX / Virtual

---

## 📱 Agenda

**Horario llamadas:**
- Lunes a Viernes
- 09:00 a 19:30
- Europe/Madrid timezone

**Configuración en caller.schedule:**
```json
{
  "schedule": {
    "startHour": 9,
    "startMinute": 0,
    "endHour": 19,
    "endMinute": 30,
    "weekdays": [1, 2, 3, 4, 5],
    "timezone": "Europe/Madrid"
  }
}
```

---

## 💾 Archivos backup

**Important:**
- `cache\state.json` - Guarda progreso
- `clients.csv` - Lista de 1473 clientes
- `config\config.json` - Configuración completa

---

## 📞 Soporte

**Enerlux Soluciones:**
- Email: enerlux.soluciones@gmail.com
- Tel: +34 610 243 061
- Zadarma: https://pbx.zadarma.com

---
Creado: 2026-02-12
Versión: 2.0 - Llamadas PBX completas con SIP ID
Status: ✅ Preparado, lista para pruebas
Author: Shide (OpenClaw Assistant)