/**
 * Transforma CSV del CRM Teamsale (1500 clientes) al formato del phone-agent
 */

const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const INPUT_CSV = '/Users/clowd/.openclaw/workspace/ai-phone-agent/data/leads-1500.csv';
const OUTPUT_CSV = '/Users/clowd/.openclaw/workspace/ai-phone-agent/clients.csv';

const PROVINCIAS_ES = ['ALICANTE','MADRID','BARCELONA','SEVILLA','VALENCIA','MALAGA','A CORUÑA','ASTURIAS','NAVARRA','PAIS VASCO','GALICIA','CASTELLON','CANTABRIA','LEÓN','TOLEDO','CIUDAD REAL','GUADALAJARA','BURGOS','ZAMORA','SALAMANCA','BIZKAIA','GIPUZKOA','ARABA','SANTA CRUZ DE TENERIFE','LAS PALMAS','CORDOBA','GRANADA','VALLADOLID','ZARAGOZA','TARRAGONA','GIRONA','LLEIDA','BADAJOZ','CACERES','HUELVA','ALMERIA','MURCIA','PALMA DE MALLORCA','CEUTA','MELILLA'];

function extractProvince(address, city, zip) {
  if (city && city.trim()) return city.toUpperCase();
  if (!address) return 'UNKNOWN';
  
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
  console.log('📖 Leyendo CSV del CRM Teamsale (1500 clientes)...');
  
  const records = [];
  let withPhone = 0;
  let withEmail = 0;
  let withDNI = 0;
  let withIBAN = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_CSV)
      .pipe(csv())
      .on('data', (row) => {
        const province = extractProvince(row['Address'], row['City'], row['ZIP']);
        const phone = row['Personal Phones'] || row['Work Phones'];
        
        if (phone && phone.trim()) {
          withPhone++;
          const email = row['Personal Emails'] || row['Work Emails'];
          if (email && email.trim()) withEmail++;
          
          const dni = row['DNI '] || row['DNI'];
          if (dni && dni.trim()) withDNI++;
          
          const iban = row['IBAN'];
          if (iban && iban.trim()) withIBAN++;
          
          records.push({
            ID: row['ID'],
            Name: row['Name'],
            'Personal Phones': row['Personal Phones'] || '',
            'Personal Emails': row['Personal Emails'] || '',
            'Work Phones': row['Work Phones'] || '',
            'Work Emails': row['Work Emails'] || '',
            Address: row['Address'] || '',
            City: row['City'] || province,
            ZIP: row['ZIP'] || '',
            'Country Name': row['Country Name'] || 'Spain',
            'CUPS LUZ ': row['CUPS LUZ '] || '',
            'CUPS GAS ': row['CUPS GAS '] || '',
            IBAN: row['IBAN'] || '',
            'DNI ': row['DNI '] || row['DNI'] || '',
            Source: row['Source'] || 'CRM Teamsale',
            Status: row['Status'] || 'Not processed'
          });
        }
      })
      .on('end', async () => {
        console.log(`✅ ${records.length} registros procesados (con teléfono)`);
        
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
        
        console.log('\n📊 Estadísticas:');
        console.log(`- Total registros: ${records.length}`);
        console.log(`- Con teléfono: ${withPhone} (${(withPhone/records.length*100).toFixed(1)}%)`);
        console.log(`- Con email: ${withEmail} (${(withEmail/records.length*100).toFixed(1)}%)`);
        console.log(`- Con DNI: ${withDNI} (${(withDNI/records.length*100).toFixed(1)}%)`);
        console.log(`- Con IBAN: ${withIBAN} (${(withIBAN/records.length*100).toFixed(1)}%)`);
        
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