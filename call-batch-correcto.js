require('dotenv').config();
const config = require('./config/config.json');
const ClientParser = require('./src/csv/client-parser');
const { Api } = require('zadarma-api');
const ClientCache = require('./src/cache/client-cache');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBatch() {
  console.log('🚀 Iniciando llamadas masivas CORREGIDAS...');
  console.log('=====================================\n');

  // Inicializar Zadarma
  const zadarma = new Api(
    config.zadarma.apiKey,
    config.zadarma.secret
  );

  // Inicializar cache
  const cache = new ClientCache();
  cache.printStats();

  // Cargar clientes
  const parser = new ClientParser(config.clients.csvPath);
  await parser.parseClients();

  // Filtrar clientes ya procesados
  const allClients = parser.clients;
  const processedIds = cache.getProcessedIds();

  // Solo nuevos clientes
  const newClients = allClients.filter(client => {
    const isCached = cache.has(client.id);
    if (isCached) {
      console.log(`⏭ ${client.name} (${client.phone}) - Ya procesado`);
    }
    return !isCached;
  });

  // Adicionar nuevos al cache
  newClients.forEach(client => {
    cache.set(client.id, {
      ...client,
      status: 'Not processed'
    });
  });

  const pending = cache.getPending();

  console.log(`\n📊 Resumen:`);
  console.log(`  Total en CSV: ${allClients.length}`);
  console.log(`  En cache: ${processedIds.length}`);
  console.log(`  Nuevos: ${newClients.length}`);
  console.log(`  Pendientes para llamar: ${pending.length}\n`);

  // Procesar en lotes
  const BATCH_SIZE = 10;
  const batch = pending.slice(0, BATCH_SIZE);

  console.log(`📞 Iniciando lote de ${batch.length} llamadas...\n`);

  for (let i = 0; i < batch.length; i++) {
    const client = batch[i];
    const index = i + 1;

    console.log(`[${index}/${batch.length}] ${client.name} - ${client.phone}`);

    try {
      // ✅ LLAMADA PBX DIRECTA usando SIP ID
      const response = await zadarma.call('/v1/pbx/request/call/', {
        sip: config.zadarma.pbx.sipId,           // 249312
        number: client.phone.replace(/\D/g, '')   // Destino: +34610243061 → 34610243061
      });

      console.log('✅ Llamada iniciada:', response);

      // Actualizar cache
      cache.updateStatus(client.id, 'Called', {
        callId: response.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en la llamada:', error.message);

      // Actualizar cache con error
      cache.updateStatus(client.id, 'Error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Esperar entre llamadas
    if (i < batch.length - 1) {
      console.log('⏳ Esperando 20 segundos...\n');
      await sleep(20000);
    }
  }

  // Guardar estado del cache
  cache.saveState();

  // Mostrar estadísticas finales
  console.log('\n=====================================');
  console.log('📊 Estadísticas Finales');
  console.log('=====================================');
  cache.printStats();

  console.log('\n🏁 Proceso terminado');
}

runBatch();