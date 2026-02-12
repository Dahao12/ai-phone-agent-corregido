/**
 * Zadarma HTTP Client - Opción B (Simplificada)
 * Realiza llamadas via API HTTP en vez de SIP
 */

const crypto = require('crypto');
const axios = require('axios');

class ZadarmaHTTPClient {
  constructor(config) {
    this.apiKey = config.zadarma.apiKey;
    this.secret = config.zadarma.secret;
    this.baseUrl = config.zadarma.baseUrl;
    this.fromNumber = config.zadarma.fromNumber;
    this.email = config.zadarma.email;
  }

  /**
   * Genera firma MD5 para autenticación Zadarma API
   */
  _generateSignature(params, method = 'GET') {
    const paramsString = Object.keys(params)
      .sort()
      .map(key => `${key}${params[key]}`)
      .join('');

    const authString = `${this.apiKey}${paramsString}${method}`;
    return crypto.createHash('md5').update(authString).digest('hex');
  }

  /**
   * Hace una petición autenticada a Zadarma API
   */
  async _request(endpoint, params = {}, method = 'GET') {
    const signature = this._generateSignature(params, method);

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        params,
        headers: {
          'Authorization': signature,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error en petición Zadarma:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verifica saldo y límites de la cuenta Zadarma
   */
  async getBalance() {
    console.log('💰 Consultando saldo Zadarma...');

    try {
      const result = await this._request('/info/balance/');

      console.log(`✅ Saldo: ${result.balance} ${result.currency}`);
      console.log(`✅ Creditos: ${result.currency} disponibles`);

      return result;
    } catch (error) {
      console.error('❌ Error al consultar saldo:', error.message);
      throw error;
    }
  }

  /**
   * Hace una llamada outbound a un número de teléfono
   * @param {string} phoneNumber - Número de teléfono del cliente (+34...)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Respuesta de Zadarma
   */
  async makeCall(phoneNumber, options = {}) {
    const from = options.from || this.fromNumber;
    const record = options.record !== undefined ? options.record : false; // No grabar por defecto

    const params = {
      caller_id: from,
      to: phoneNumber,
      sip: false,
      predicted: false,
      user_id: options.userId || null,
      record: record
    };

    console.log(`📞 Iniciando llamada HTTP a ${phoneNumber} desde ${from}...`);

    try {
      const response = await this._request('/requests/callback/', params, 'POST');

      console.log(`✅ Llamada iniciada via HTTP:`);
      console.log(`   Call ID: ${response.call_id || 'N/A'}`);
      console.log(`   Status: ${response.status || 'initiated'}`);

      // Guardar info de llamada
      const callId = response.call_id || `call-${Date.now()}`;
      const callInfo = {
        id: callId,
        phone: phoneNumber,
        from: from,
        status: 'initiated',
        started: new Date()
      };

      return {
        success: true,
        callId,
        callInfo,
        response
      };

    } catch (error) {
      console.error(`❌ Error al iniciar llamada HTTP a ${phoneNumber}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verifica el estado de una llamada específica
   * @param {string} callId - ID de la llamada
   * @returns {Promise<Object>} - Status de la llamada
   */
  async getCallStatus(callId) {
    try {
      const result = await this._request('/requests/status/', { call_id: callId });
      return result;
    } catch (error) {
      console.error(`❌ Error al consultar status de llamada ${callId}:`, error.message);
      throw error;
    }
  }

  /**
   * Cuelga una llamada activa
   * @param {string} callId - ID de la llamada
   * @returns {Promise<Object>} - Respuesta de la operación
   */
  async hangupCall(callId) {
    console.log(`📞 Cuelgando llamada ${callId}...`);

    try {
      const result = await this._request('/requests/hangup/', { call_id: callId }, 'POST');

      console.log(`✅ Llamada ${callId} colgada`);
      return result;
    } catch (error) {
      console.error(`❌ Error al colgar llamada ${callId}:`, error.message);
      throw error;
    }
  }

  /**
   * Envía audio a Zadarma para reproducir durante llamada
   * @param {string} callId - ID de la llamada
   * @param {string} audioUrl - URL del archivo de audio
   * @returns {Promise<Object>} - Respuesta de la operación
   */
  async playAudio(callId, audioUrl) {
    console.log(`🎵 Reproduciendo audio en llamada ${callId}: ${audioUrl}`);

    try {
      const result = await this._request('/requests/playback/', {
        call_id: callId,
        url: audioUrl
      }, 'POST');

      console.log(`✅ Audio en cola para reproducir`);
      return result;
    } catch (error) {
      console.error(`❌ Error al reproducir audio en llamada ${callId}:`, error.message);
      throw error;
    }
  }

  /**
   * Verifica información de la cuenta Zadarma
   */
  async getAccountInfo() {
    try {
      const result = await this._request('/info/');

      console.log(`📊 Account Info:`);
      console.log(`   Currency: ${result.currency}`);
      console.log(`   Number: ${result.number || 'N/A'}`);

      return result;
    } catch (error) {
      console.error('❌ Error al consultar info de cuenta:', error.message);
      throw error;
    }
  }

  /**
   * Lista números disponibles en tu cuenta
   */
  async getNumbers() {
    try {
      const result = await this._request('/numbers/');

      console.log(`📞 Números disponibles:`);
      result.numbers?.forEach(num => {
        console.log(`   ${num.number} (${num.type || 'unknown'})`);
      });

      return result;
    } catch (error) {
      console.error('❌ Error al consultar números:', error.message);
      throw error;
    }
  }

  /**
   * Verifica el límite de llamadas mensuales
   */
  async getCallLimits() {
    try {
      const info = await this.getAccountInfo();
      const balance = await this.getBalance();

      const limits = {
        balance: balance.balance,
        currency: balance.currency,
        availableCalls: Math.floor(balance.balance / 0.15), // ~€0.15/min extra
        packageMinutes: 2000, // Paquete básico
        minutesUsed: info.minutes_used || 0
      };

      console.log(`📊 Limits:`);
      console.log(`   Balance: ${limits.balance} ${limits.currency}`);
      console.log(`   Llamadas disponibles extra: ~${limits.availableCalls}`);
      console.log(`   Minutos paquete: ${limits.packageMinutes}`);
      console.log(`   Minutos usados: ${limits.minutesUsed}`);

      return limits;
    } catch (error) {
      console.error('❌ Error al consultar límites:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si el número de origen está configurado correctamente
   */
  async verifyFromNumber() {
    const numbers = await this.getNumbers();
    const found = numbers.numbers?.find(n => n.number === this.fromNumber);

    if (found) {
      console.log(`✅ Número de origen verify: ${this.fromNumber}`);
      return true;
    } else {
      console.log(`⚠️ Número de origen NO encontrado: ${this.fromNumber}`);
      return false;
    }
  }
}

module.exports = ZadarmaHTTPClient;