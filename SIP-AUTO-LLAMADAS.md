# Llamadas AI Automáticas - Configuración SIP

## 🔧 Configuración Zadarma

**Extensión:** 100
**Usuario SIP:** 547736-100
**SIP ID:** 249312
**Password:** hCbud5Y8RS
**Domain:** pbx.zadarma.com

**Número público:** +34936941917 (CallerID al cliente)

---

## 🤖 Flujo de la llamada automática

1. **Zadarma inicia llamada** desde su sistema hacia extensión 100
2. **Agente SIP (JS)** recibe llamada en extensión 100
3. **Agente SI contesta** automáticamente (no necesitas contestar tú)
4. **Agente llama al cliente** tu número de destino
5. **Cliente responde** (o no)
6. **Ollama + gTTS conversan** con el cliente
7. **Llamada termina**

---

## ✅ Qué el usuario NO hace

- ❌ No contesta el softphone
- ❌ No habla
- ❌ No interactúa con nada

**Solo deja el script corriendo.**

---

## 🚀 Scripts a ejecutar

### Terminal 1: Webhook server (opcional para callbacks)
```cmd
node phone-agent-webhooks.js
```

### Terminal 2: Agente SIP automático
```cmd
node sip-agent-auto.js
```

### Terminal 3: Hacer las llamadas
```cmd
node call-clientes-auto.js
```

---

## 📋 Archivos SIP ya creados

**En tu proyecto:**
- `src/sip/sip-client.js` ✓
- `src/sip/sip-manager.js` ✓

**Solo necesitamos configurar:**
- SIP User: 547736-100
- SIP Password: hCbud5Y8RS
- SIP Domain: pbx.zadarma.com

---

## ⚙ Configuración a actualizar

**En `config/config.json`:**

```json
{
  "zadarma": {
    "apiKey": "e44e9700107ae400f471",
    "secret": "8acc083f9511f2ca9c2c",
    "fromNumber": "+34936941917"
  },
  "sip": {
    "user": "547736-100",
    "password": "hCbud5Y8RS",
    "domain": "pbx.zadarma.com",
    "extension": "100",
    "sipId": 249312
  }
}
```

---
Estado: Configurando para llamadas AI totalmente automáticas
Prioridad: ALTA - Usuario quiere que el AI conteste, no él
Creado: 2026-02-12