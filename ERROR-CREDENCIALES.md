# Error: NOT AUTHORIZED - Crédenciales incorrectas

## 🔴 El problema

La API Zadarma devuelve: `Not authorized`

Esto significa que:
- ❌ API Key incorrecta
- ❌ Secret incorrecto
- ❌ Credenciales inválidas

---

## 🔍 SOLUCIÓN: Verificar credenciales en panel Zadarma

### Paso 1: Entra en tu panel Zadarma

```
https://pbx.zadarma.com/index.php
```

### Paso 2: Encuentra tus credenciales API

**Opción A: Configuración general**
- Settings → API Settings
- Look for "API Key" y "Secret"
- Copia exactamente (sin espacios)

**Opción B: Integraciones**
- Integrations → API
- API Key:
- Secret:

---

## ✅ Credenciales actuales (probablemente INCORRECTAS)

**Estás usando:**
```javascript
apiKey:  'ac5d629484b7b7f7d715'
secret:  '37fa40eb003ee9987622'
```

❌ **Estas NO son válidas según Zadarma**

---

## 🔧 Qué hacer

1. **Verifica tus credenciales reales en el panel Zadarma**
2. **Edita el archivo config\config.json**
3. **Reemplaza apiKey y secret con los correctos**

**Nuevas credenciales deberían verse así:**
```json
{
  "zadarma": {
    "apiKey": "TU_API_KEY_REAL",
    "secret": "TU_SECRET_REAL",
    "fromNumber": "+34936941917"
  }
}
```

---

## ❓ ¿Dónde encontrar las credenciales?

**Panel Zadarma:**
1. Login en https://pbx.zadarma.com
2. Settings → API
3. Look for:
   - Key: [copia esto]
   - Secret: [copia esto]

**O**
1. Profile → Integrations
2. API Keys

---

## 🚀 Después de actualizar

**Intenta de nuevo:**
```cmd
node -e "const { Api } = require('zadarma-api'); const client = new Api('TU_NUEVA_API_KEY', 'TU_NUEVO_SECRET'); (async () => { const bal = await client.getBalance(); console.log('Balance:', bal.balance); })()"
```

---

### Importante

- Los credenciales son CASE SENSITIVE
- No agregar espacios
- Copiar exactamente del panel

---
Creado: 2026-02-12
Status: ERROR - Requiere verificar credenciales Zadarma