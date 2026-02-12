/**
 * Verifica los clientes del CSV
 */

const ClientParser = require('../src/csv/client-parser');

async function verifyClients() {
  const parser = new ClientParser('/Users/clowd/.openclaw/workspace/ai-phone-agent/clients.csv');
  
  console.log('📖 Cargando clientes...');
  await parser.parseClients();
  
  const stats = parser.getStats();
  
  console.log('\n📊 Estadísticas:');
  console.log(`- Total: ${stats.total}`);
  console.log(`- Llamados: ${stats.called}`);
  console.log(`- Pendientes: ${stats.notCalled}`);
  
  console.log('\n👥 Próximos 5 clientes a llamar:');
  for (let i = 0; i < 5 && i < parser.clients.length; i++) {
    const client = parser.clients[i];
    console.log(`${i+1}. ${client.name}`);
    console.log(`   Teléfono: ${client.phone}`);
    console.log(`   Email: ${client.email || 'N/A'}`);
    console.log(`   Dirección: ${client.city} ${client.zip}`);
    console.log(`   DNI: ${client.dni}`);
    console.log(`   Estado: ${client.status}`);
    console.log('');
  }
}

verifyClients()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });