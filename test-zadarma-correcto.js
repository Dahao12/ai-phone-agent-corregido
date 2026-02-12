require('dotenv').config();
const { Api } = require('zadarma-api');

const client = new Api(
  'ac5d629484b7b7f7d715',
  '37fa40eb003ee9987622'
);

async function testCorrecto() {
  console.log('=====================================');
  console.log('📞 PRUEBA CORRECTA - Zadarma API');
  console.log('=====================================\n');

  // Paso 1: Verificar balance
  console.log('[1/2] Verificando saldo...\n');
  try {
    const balance = await client.getBalance();
    console.log(`✅ Balance: ${balance.balance} ${balance.currency}`);
    console.log(`   Status: ${balance.status}`);
  } catch (error) {
    console.log('❌ Error al verificar balance:', error.message);
  }

  console.log('\n[2/2] Haciendo llamada...\n');

  // Uso CORRECTO de requestCallback
  try {
    const result = await client.requestCallback(
      '34936941917',  // from (sin el +)
      '34610243061'   // to (sin el +)
    );

    console.log('✅ Resultado de llamada:');
    console.log('-', result);

    if (result.status === 'success') {
      console.log('\n📊 Detalles:');
      console.log('- Status:', result.status);
      console.log('- From:', result.from);
      console.log('- To:', result.to);
      console.log('- Time:', result.time);
      console.log('- Type: SALIENTE (direct)');

      console.log('\n⏳ Esperando 10 segundos para ver si timbra...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('⏱ Tiempo terminado');

    } else {
      console.log('\n⚠️ Respuesta inesperada:', result);
    }

  } catch (error) {
    console.log('\n❌ Error en la llamada:');
    console.log('-', error.message);

    if (error.response) {
      console.log('Detalles del error:', error.response.data);
    }
    if (error.response?.data) {
      console.log('Mensaje API:', error.response.data);
    }
  }

  console.log('\n=====================================');
  console.log('PRUEBA COMPLETADA');
  console.log('=====================================\n');

  console.log('Si NO recibiste la llamada:');
  console.log('1. Verifica tu panel Zadarma: Numbers → View');
  console.log('2. ¿El número +34936941917 está en tu cuenta?');
  console.log('3. ¿Está activo para llamadas salientes?');
  console.log('4. Verifica el número destino +34610243061');
}

testCorrecto();