/**
 * Zadarma Caller Engine
 * Sistema de llamadas automatizadas para Enerlux
 */

const crypto = require('crypto');
const axios = require('axios');

class ZadarmaCaller {
  constructor(config) {
    this.apiKey = config.zadarma.apiKey;
    this.secret = config.zadarma.secret;
    this.baseUrl = config.zadarma.baseUrl;
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
   * Hace una llamada outbound a un número de teléfono
   * @param {string} phoneNumber - Número de teléfono del cliente
   * @param {string} fromNumber - Número de origen
   * @param {Object} options - Opciones adicionales
   */
  async makeCall(phoneNumber, fromNumber, options = {}) {
    const params = {
      caller_id: fromNumber,
      to: phoneNumber,
      sip: options.sip === undefined ? false : options.sip,
      predicted: options.predicted === undefined ? false : options.predicted,
      user_id: options.userId
    };

    console.log(`📞 Llamando a ${phoneNumber} desde ${fromNumber}...`);

    try {
      const response = await this._request('/requests/callback/', params, 'POST');
      console.log(`✅ Llamada iniciada: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      console.error(`❌ Error al llamar a ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtiene el estado de una llamada
   */
  async getCallStatus(callId) {
    try {
      const response = await this._request(`/status/${callId}/`);
      return response;
    } catch (error) {
      console.error('Error al obtener estado de llamada:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene el registro de llamadas
   */
  async getCallRecords(params = {}) {
    try {
      const response = await this._request('/records/', params);
      return response;
    } catch (error) {
      console.error('Error al obtener registros:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene el saldo de la cuenta Zadarma
   */
  async getBalance() {
    try {
      const response = await this._request('/info/balance/');
      return response;
    } catch (error) {
      console.error('Error al obtener saldo:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si estamos dentro del horario permitido
   */
  isWithinSchedule(config) {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const dayOfWeek = now.getDay();

    const { startHour, startMinute, endHour, endMinute, weekdays } = config.schedule;

    // Verificar día de la semana (1 = Lunes, 5 = Viernes)
    if (!weekdays.includes(dayOfWeek)) {
      console.log(`⏰ Fuera de horario: día ${dayOfWeek} no es laboral`);
      return false;
    }

    // Verificar hora
    const currentTime = hour * 60 + minute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (currentTime < startTime || currentTime > endTime) {
      console.log(`⏰ Fuera de horario: ${hour}:${minute} no está en ${startHour}:${startMinute} - ${endHour}:${endMinute}`);
      return false;
    }

    console.log(`✅ Dentro de horario: ${hour}:${minute}`);
    return true;
  }
}

module.exports = ZadarmaCaller;