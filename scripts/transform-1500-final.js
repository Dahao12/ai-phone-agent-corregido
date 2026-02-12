/**
 * Transforma CSV del CRM Teamsale (1500 clientes) al formato del phone-agent
 * Versión final - leer el ID manualmente de cada línea
 */

const fs = require('fs');
const { parse } = require('csv-parse');
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
  
  const results = [];
  let lineNum = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_CSV, { encoding: 'utf8' })
      .pipe(parse({
        columns: true,
        trim: true,
        skip_empty_lines: true,
        relax: true,
        relax_column_count: true
      }))
      .on('data', (row) => {
        lineNum++;
        
        // Extraer ID de la primera columna
        // El ID es el primer campo de cada línea
        const fields = Object.values(row);
        const rawID = fields[0] || lineNum.toString();
        
        // Limpiar el ID (puede tener comas o caracteres especiales)
        const cleanID = String(rawID).replace(/^["']|["']$/g, '').trim();
        
        const province = extractProvince(row.Address, row.City, row.ZIP);
        const phone = row['Personal Phones'] || row['Work Phones'];
        
        if (phone && phone.trim()) {
          results.push({
            ID: cleanID,
            Name: row.Name || '',
            'Personal Phones': row['Personal Phones'] || '',
            'Personal Emails': row['Personal Emails'] || '',
            'Work Phones': row['Work Phones'] || '',
            'Work Emails': row['Work Emails'] || '',
            Address: row.Address || '',
            City: row.City || province,
            ZIP: row.ZIP || '',
            'Country Name': row['Country Name'] || 'Spain',
            'CUPS LUZ ': row['CUPS LUZ '] || '',
            'CUPS GAS ': row['CUPS GAS '] || '',
            IBAN: row.IBAN || '',
            'DNI ': row['DNI '] || row['DNI'] || '',
            Source: row.Source || 'CRM Teamsale',
            Status: row.Status || 'Not processed'
          });
        }
      })
      .on('end', async () => {
        console.log(`✅ ${results.length} registros procesados (con teléfono)`);
        
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
        
        await csvWriter.writeRecords(results);
        console.log(`✅ CSV guardado: ${OUTPUT_CSV}`);
        
        const withPhone = results.length;
        const withEmail = results.filter(r => (r['Personal Emails'] || r['Work Emails'])).length;
        const withDNI = results.filter(r => r['DNI ']).length;
        const withIBAN = results.filter(r => r.IBAN).length;
        
        console.log('\n📊 Estadísticas:');
        console.log(`- Total registros: ${results.length}`);
        console.log(`- Con teléfono: ${withPhone} (100.0%)`);
        console.log(`- Con email: ${withEmail} (${(withEmail/results.length*100).toFixed(1)}%)`);
        console.log(`- Con DNI: ${withDNI} (${(withDNI/results.length*100).toFixed(1)}%)`);
        console.log(`- Con IBAN: ${withIBAN} (${(withIBAN/results.length*100).toFixed(1)}%)`);
        
        console.log('\n👥 Primeros 3 clientes:');
        results.slice(0, 3).forEach((r, i) => {
          console.log(`${i+1}. ${r.Name}`);
          console.log(`   ID: ${r.ID}`);
          console.log(`   Teléfono: ${r['Personal Phones']}`);
        });
        
        resolve(results);
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