/**
 * Transforma CSV original al formato del phone-agent
 */

const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const INPUT_CSV = '/Users/clowd/.openclaw/workspace/ai-phone-agent/data/leads-2026-02-11-original.csv';
const OUTPUT_CSV = '/Users/clowd/.openclaw/workspace/ai-phone-agent/clients.csv';

const PROVINCIAS_ES = ['ALICANTE','MADRID','BARCELONA','SEVILLA','VALENCIA','MALAGA','A CORUÑA','ASTURIAS','NAVARRA','PAIS VASCO','GALICIA','CASTELLON','CANTABRIA','LEÓN','TOLEDO','CIUDAD REAL','GUADALAJARA','BURGOS','ZAMORA','SALAMANCA','BIZKAIA','GIPUZKOA','ARABA','SANTA CRUZ DE TENERIFE','LAS PALMAS','CORDOBA','GRANADA','VALLADOLID','ZARAGOZA'];

function extractProvince(address) {
  const upper = address.toUpperCase();
  
  for (const provincia of PROVINCIAS_ES) {
    if (upper.includes(provincia.toUpperCase())) {
      return provincia.toUpperCase();
    }
  }
  
  if (upper.includes('BIZKAIA') || upper.includes('VIZCAYA')) return 'BIZKAIA';
  if (upper.includes('GUIPUZKOA')) return 'GIPUZKOA';
  if (upper.includes('ARABA') || upper.includes('ALAVA')) return 'ARABA';
  
  return 'UNKNOWN';
}

async function transformCSV() {
  console.log('📖 Leyendo CSV original...');
  
  const records = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_CSV)
      .pipe(csv())
      .on('data', (row) => {
        const province = extractProvince(row['DIRECCION'] || '');
        
        records.push({
          ID: row['ID'],
          Name: row['Name'],
          'Personal Phones': row['Personal Phones'],
          'Personal Emails': row['Personal Emails'] || '',
          'Work Phones': '',
          'Work Emails': '',
          Address: row['DIRECCION'] || '',
          City: province,
          ZIP: row['CODIGO POSTAL'] || '',
          'Country Name': 'Spain',
          'CUPS LUZ ': '',
          'CUPS GAS ': '',
          IBAN: '',
          'DNI ': row['DNI '] || row['DNI'] || '',
          Source: 'Manual',
          Status: 'Not processed'
        });
      })
      .on('end', async () => {
        console.log(`✅ ${records.length} registros procesados`);
        
        const csvWriter = createCsvWriter({
          path: OUTPUT_CSV,
          header: [
            {id: 'ID', title: 'ID'},
            {id: 'Name', title: 'Name'},
            {id: 'Personal Phones', title: 'Personal Phones'},
            {id: 'Personal Emails', title: 'Personal Emails'},
            {id: 'Work Phones', title: 'Work Phones'},
            {id: 'Work Emails', title: 'Work Emails'},
            {id: 'Address', title: 'Address'},
            {id: 'City', title: 'City'},
            {id: 'ZIP', title: 'ZIP'},
            {id: 'Country Name', title: 'Country Name'},
            {id: 'CUPS LUZ ', title: 'CUPS LUZ '},
            {id: 'CUPS GAS ', title: 'CUPS GAS '},
            {id: 'IBAN', title: 'IBAN'},
            {id: 'DNI ', title: 'DNI '},
            {id: 'Source', title: 'Source'},
            {id: 'Status', title: 'Status'}
          ]
        });
        
        await csvWriter.writeRecords(records);
        console.log(`✅ CSV guardado: ${OUTPUT_CSV}`);
        
        const withPhone = records.filter(r => r['Personal Phones']).length;
        const withEmail = records.filter(r => r['Personal Emails']).length;
        
        console.log('\n📊 Estadísticas:');
        console.log(`- Total: ${records.length}`);
        console.log(`- Con teléfono: ${withPhone}`);
        console.log(`- Con email: ${withEmail}`);
        
        resolve(records);
      })
      .on('error', (error) => {
        console.error('❌ Error:', error);
        reject(error);
      });
  });
}

transformCSV()
  .then(() => {
    console.log('\n✅ Transformación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });