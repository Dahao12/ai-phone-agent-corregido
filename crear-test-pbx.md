# Crear test-pbx.js en Windows

## Opción 1: Usar PowerShell (RECOMENDADO)

**1. Abre PowerShell** (o usa la misma terminal que tienes)

**2. Ejecuta este comando:**

```powershell
@"
const { Api } = require('zadarma-api');
const client = new Api('ac5d629484b7b7f7d715', '37fa40eb003ee9987622');

async function testPBX() {
  console.log('=== TEST LLAMADA PBX ===');
  const balance = await client.getBalance();
  console.log('Balance:', balance.balance, balance.currency);

  const result = await client.call('/v1/pbx/request/', {
    from: '547736-100',
    to: '34610243061'
  });

  console.log('Resultado:', result);
  await new Promise(resolve => setTimeout(resolve, 12000));
  console.log('=== COMPLETADO ===');
}

testPBX();
"@ | Out-File -FilePath "C:\ai-phone-agent-corregido-main\test-pbx.js" -Encoding utf8
```

**3. Ejecutar:**
```powershell
node C:\ai-phone-agent-corregido-main\test-pbx.js
```

---

## Opción 2: Usar CMD (si no funciona PowerShell)

**1. En tu terminal de CMD, crea un archivo vacío primero:**

```cmd
echo. > test-pbx.txt
```

**2. Abre el archivo con Notepad:**

```cmd
notepad test-pbx.txt
```

**3. Copia y pega el código:**

```javascript
const { Api } = require('zadarma-api');
const client = new Api('ac5d629484b7b7f7d715', '37fa40eb003ee9987622');

async function testPBX() {
  console.log('=== TEST LLAMADA PBX ===');
  const balance = await client.getBalance();
  console.log('Balance:', balance.balance, balance.currency);

  const result = await client.call('/v1/pbx/request/', {
    from: '547736-100',
    to: '34610243061'
  });

  console.log('Resultado:', result);
  await new Promise(resolve => setTimeout(resolve, 12000));
  console.log('=== COMPLETADO ===');
}

testPBX();
```

**4. Guardar:**
- Archivo → Guardar como
- Nombre: `test-pbx.js`
- Tipo: "Todos los archivos (*.*)"
- Codificación: UTF-8 ✅

**5. Ejecutar:**
```cmd
node test-pbx.js
```

---

## Opción 3: Verificar que estás en la carpeta correcta

**Ejecuta:**
```cmd
dir
```

**Debes ver:**
- config (carpeta)
- src (carpeta)
- clients.csv
- call-batch-correcto.js
- test-llamada-saliente-correcta.js

**Si NO ves esto:**
```cmd
cd C:\ai-phone-agent-corregido-main
dir
```

---

## Opción 4: Ejecutar el código directamente sin archivo

**En tu terminal, ejecuta todo junto:**

```cmd
node -e "const { Api } = require('zadarma-api'); const client = new Api('ac5d629484b7b7f7d715', '37fa40eb003ee9987622'); (async () => { console.log('=== TEST PBX ==='); const bal = await client.getBalance(); console.log('Balance:', bal.balance); const res = await client.call('/v1/pbx/request/', {from: '547736-100', to: '34610243061'}); console.log('Resultado:', res); console.log('Esperando...'); await new Promise(r => setTimeout(r, 12000)); console.log('=== FIN ==='); })()"
```

Esta opción NO crea archivo, solo ejecuta el código una vez.