require('dotenv').config();
const { Api } = require('zadarma-api');

const client = new Api(
  'e44e9700107ae400f471',
  '8acc083f9511f2ca9c2c'
);

async function testSalidaDirecta() {
  console.log('=====================================');
  console.log('📞 PRUEBA: LLAMADA SALIENTA DIRECTA');
  console.log('Desde: 34936941917');
  console.log('Destino: 34610243061');
  console.log('=====================================\n');

  try {
    // ✅ CORRECTO: Llamada saliente directa sin 'sip'
    const result = await client.call('/v1/request/callback/', {
      from: '34936941917',   // Tu número de salida
      to: '34610243061',     // Destino
      predicted: 1
      // ❌ NO incluir 'sip'
    });

    console.log('✅ Resultado de la llamada:', result);
    console.log('\n📊 Detalles:');
    console.log('- Status:', result.status);
    console.log('- Call ID:', result.id);
    console.log('- Dirección:', 'SALIENTE ✓');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('HTTP Status:', client.getHttpCode());

    // Ver más detalles del error
    if (error.response) {
      console.log('Detalles API:', error.response.data);
    }
  }
}

async function verifyBalance() {
  console.log('📊 Verificando saldo Zadarma...\n');

  try {
    const balance = await client.getBalance();
    console.log(`✅ Balance actual: ${balance.balance} ${balance.currency}`);
    return balance;
  } catch (error) {
    console.log('❌ Error al verificar balance:', error.message);
    return null;
  }
}

// Ejecutar pruebas
(async () => {
  await verifyBalance();
  console.log('\n');
  await testSalidaDirecta();
})();