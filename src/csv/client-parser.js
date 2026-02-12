/**
 * Client Parser - Lee y procesa clientes del CSV
 */

const fs = require('fs');
const csv = require('csv-parser');

class ClientParser {
  constructor(csvPath) {
    this.csvPath = csvPath;
    this.clients = [];
  }

  /**
   * Lee el CSV de clientes
   */
  async parseClients() {
    return new Promise((resolve, reject) => {
      const clients = [];

      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Extraer datos relevantes del CRM teamsale
          const client = {
            id: row.ID,
            name: row.Name,
            phone: this._extractPhone(row),
            email: row['Personal Emails'] || row['Work Emails'] || '',
            address: row.Address || '',
            city: row.City || '',
            zip: row.ZIP || '',
            country: row['Country Name'] || 'Spain',
            cupsLuz: row['CUPS LUZ '] || '',
            cupsGas: row['CUPS GAS '] || '',
            iban: row.IBAN || '',
            dni: row['DNI '] || '',
            source: row.Source || 'Manual',
            status: row.Status || 'Not processed',
            called: false,
            callCount: 0,
            lastCalled: null,
            outcome: null,
            notes: ''
          };

          // Solo incluir clientes con teléfono válido
          if (client.phone) {
            clients.push(client);
          }
        })
        .on('end', () => {
          console.log(`✅ ${clients.length} clientes cargados del CSV`);
          this.clients = clients;
          resolve(clients);
        })
        .on('error', (error) => {
          console.error('❌ Error al leer CSV:', error);
          reject(error);
        });
    });
  }

  /**
   * Extrae el número de teléfono (Work o Personal)
   */
  _extractPhone(row) {
    const workPhone = row['Work Phones'];
    const personalPhone = row['Personal Phones'];

    // Priorizar teléfono personal
    if (personalPhone && personalPhone.trim()) {
      return this._normalizePhone(personalPhone);
    }

    // Si no hay personal, usar work
    if (workPhone && workPhone.trim()) {
      return this._normalizePhone(workPhone);
    }

    return null;
  }

  /**
   * Normaliza el número de teléfono
   */
  _normalizePhone(phone) {
    // Eliminar espacios, paréntesis, guiones
    let normalized = phone.replace(/[\s\-\(\)]/g, '');

    // Asegurar formato internacional (+34...)
    if (!normalized.startsWith('+')) {
      if (normalized.startsWith('34')) {
        normalized = '+' + normalized;
      } else if (normalized.startsWith('6') || normalized.startsWith('7') || normalized.startsWith('8') || normalized.startsWith('9')) {
        normalized = '+34' + normalized;
      }
    }

    return normalized;
  }

  /**
   * Obtiene siguiente cliente no llamado
   */
  getNextClient() {
    const notCalled = this.clients.filter(c => !c.called && c.status === 'Not processed');

    if (notCalled.length === 0) {
      console.log('⚠️ No hay más clientes para llamar');
      return null;
    }

    return notCalled[0];
  }

  /**
   * Obtiene clientes no llamados (batch)
   */
  getNextClientsBatch(batchSize) {
    const notCalled = this.clients.filter(c => !c.called && c.status === 'Not processed');
    return notCalled.slice(0, batchSize);
  }

  /**
   * Actualiza estado de un cliente
   */
  updateClientStatus(clientId, status, outcome = null, notes = '') {
    const client = this.clients.find(c => c.id === clientId);

    if (client) {
      client.called = true;
      client.callCount += 1;
      client.lastCalled = new Date().toISOString();
      client.status = status;
      client.outcome = outcome;
      client.notes = notes;

      console.log(`✅ Cliente ${client.name} (${clientId}) actualizado: ${status}`);
    }
  }

  /**
   * Obtiene estadísticas
   */
  getStats() {
    const total = this.clients.length;
    const called = this.clients.filter(c => c.called).length;
    const answered = this.clients.filter(c => c.outcome === 'Answered').length;
    const voicemail = this.clients.filter(c => c.outcome === 'Voicemail').length;
    const interested = this.clients.filter(c => c.outcome === 'Interested').length;

    return {
      total,
      called,
      notCalled: total - called,
      answered,
      voicemail,
      interested,
      conversionRate: called > 0 ? (interested / called * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Exporta clientes a CSV (para backup)
   */
  exportClients() {
    const csvContent = this.clients.map(c => [
      c.id,
      c.name,
      c.phone,
      c.email,
      c.status,
      c.outcome,
      c.callCount,
      c.lastCalled,
      c.notes
    ].join(',')).join('\n');

    const header = 'ID,Name,Phone,Email,Status,Outcome,CallCount,LastCalled,Notes\n';
    fs.writeFileSync(`${this.csvPath}.output.csv`, header + csvContent);
    console.log('✅ Clientes exportados a CSV');
  }
}

module.exports = ClientParser;