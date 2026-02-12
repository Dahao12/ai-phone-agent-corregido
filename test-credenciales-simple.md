# Comandos simples para verificar credenciales

## Opción 1: PowerShell - Verificar credenciales simples

```powershell
node -e "const { Api } = require('zadarma-api'); (async () => { console.log('Verificando...'); const c = new Api('ac5d629484b7b7f7d715', '37fa40eb003ee9987622'); const b = await c.getBalance(); console.log('Balance:', b.balance); })()"
```

SI esto dice "Not authorized", las credenciales están INCORRECTAS.

---

## Opción 2: PowerShell - Crear test simple y ejecutar

```powershell
@"
const { Api } = require('zadarma-api');
const c = new Api('ac5d629484b7b7f7d715', '37fa40eb003ee9987622');
c.getBalance().then(b => console.log('Balance:', b.balance)).catch(e => console.log('Error:', e.message));
"@ | Out-File test-cred.js -Encoding utf8

node test-cred.js
```

---

## Opción 3: CMD - Una línea simple

```cmd
node -e "const { Api } = require('zadarma-api'); new Api('ac5d629484b7b7f7d715', '37fa40eb003ee9987622').getBalance().then(b => console.log('Balance:', b.balance)).catch(e => console.log('Error:', e.message))"
```

---

## Si dice "Not authorized":

1. Entra en panel Zadarma: https://pbx.zadarma.com
2. Settings → API
3. Verifica tus credenciales reales
4. Las que tienes probablemente no son correctas

---

## Después de obtener credenciales correctas:

Reemplaza 'ac5d629484b7b7f7d715' con TU_NUEVA_API_KEY
Reemplaza '37fa40eb003ee9987622' with TU_NUEVO_SECRET