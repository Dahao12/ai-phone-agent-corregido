require('dotenv').config();
const { Api } = require('zadarma-api');

const client = new Api(
  'ac5d629484b7b7f7d715',
  '37fa40eb003ee9987622'
);

async function testPBX() {
  console.log('=====================================');
  console.log('📞 TEST: Llamada PBX CORRECTA');
  console.log('=====================================\n');

  // Verificar balance
  console.log('[1/3] Verificando saldo...');
  try {
    const balance = await client.getBalance();
    console.log(`✅ Balance: ${balance.balance} ${balance.currency}`);
  } catch (error) {
    console.log('❌ Error balance:', error.message);
    return;
  }

  // Para PBX, necesitas usar la extensión SIP interna
  // NO el número público (+34936941917)

  const extension = '547736102'; // ← CAMBIA ESTO a tu extensión SIP interna
  console.log(`\n[2/3] Extensión SIP: ${extension}`);
  console.log(`[2/3] Número público: +34936941917`);
  console.log(`[2/3] Destino: +34610243061\n`);

  console.log('[3/3] Haciendo llamada PBX...\n');

  try {
    // Llamada PBX - Extensión interna → Destino
    const result = await client.call('/v1/pbx/request/', {
      from: extension,           // ← Extensión SIP interna
      to: '34610243061',         // ← Destino (sin +)
      route: 'internal'          // ← Llamada interna PBX
    });

    console.log('✅ Resultado:');
    console.log('-', result);

    if (result && result.status === 'success') {
      console.log('\n📊 Detalles:');
      console.log('- Status:', result.status);
      console.log('- Type: LLAMADA PBX SALIENTE');
      console.log('- Desde: Extensión SIP interna');
      console.log('- Destino: 34610243061');

      console.log('\n⏳ Esperando 10 segundos...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('⏱ Finalizado');
    } else {
      console.log('\n⚠️ Respuesta:', result);
    }

  } catch (error) {
    console.log('\n❌ Error en la llamada PBX:');
    console.log('-', error.message);

    if (error.response) {
      console.log('\nDetalles:');
      console.log('-', error.response.data);
    }
  }

  console.log('\n=====================================');
  console.log('IMPORTANTE - Para PBX:');
  console.log('=====================================');
  console.log('');
  console.log('1. No usas el número público (+34936941917)');
  console.log('   Solo es CallerID para mostrar al que recibe');
  console.log('');
  console.log('2. Usas la EXTENSION SIP INTERNA');
  console.log('   Ejemplos: 100, 102, 547736-102, etc.');
  console.log('');
  console.log('3. Encontrar tu extensión:');
  console.log('   Panel Zadarma → Settings → SIP Connections');
  console.log('   Busca la extensión asociada al número');
  console.log('');
}

testPBX();