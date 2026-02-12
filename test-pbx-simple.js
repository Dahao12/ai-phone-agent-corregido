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

  // Extension SIP real del usuario
  const extension = '547736-100';
  console.log(`\n[2/3] Extension: ${extension}`);
  console.log(`[2/3] Nombre: Extension 100`);
  console.log(`[2/3] Caller ID: +34936941917`);
  console.log(`[2/3] Destino: +34610243061\n`);

  console.log('[3/3] Haciendo llamada PBX...\n');

  try {
    // Llamada PBX - Extensión interna → Destino
    const result = await client.call('/v1/pbx/request/', {
      from: extension,
      to: '34610243061',
      // Sin 'route' - Zadarma determina automáticamente
    });

    console.log('✅ Resultado:');
    console.log('-', result);

    if (result && result.status === 'success') {
      console.log('\n📊 Detalles:');
      console.log('- Status:', result.status);
      console.log('- Type: LLAMADA PBX SALIENTE');
      console.log('- Desde: Extension 547736-100');
      console.log('- Destino: 34610243061');

      console.log('\n⏳ Esperando 12 segundos...');
      await new Promise(resolve => setTimeout(resolve, 12000));
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
  console.log('COMPLETADO');
  console.log('=====================================\n');
}

testPBX();