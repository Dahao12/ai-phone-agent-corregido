/**
 * Webhook Server - Zadarma Opción B (Simplificada)
 * Recibe callbacks de Zadarma y maneja llamadas reales
 */

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const RealCallingProtocol = require('../caller/real-calling-protocol');

class WebhookServer {
  constructor(config, ai, tts, zap) {
    this.config = config;
    this.ai = ai; // Ollama integration
    this.tts = tts; // gTTS integration
    this.zap = zap; // Zadarma API
    this.app = express();
    this.callingProtocol = new RealCallingProtocol(config, ai, tts);
    this.activeCalls = new Map();
    this.port = config.zadarma?.webhookPort || 3000;

    this._setupMiddleware();
    this._setupRoutes();
  }

  /**
   * Configura middleware
   */
  _setupMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Log de todas las requests
    this.app.use((req, res, next) => {
      console.log(`📨 ${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Configura routes
   */
  _setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date() });
    });

    // Zadarma Webhook principal
    this.app.post('/zadarma/webhook', (req, res) => {
      this.handleZadarmaWebhook(req, res);
    });

    // Zadarma Callback Notification
    this.app.post('/zadarma/callback', (req, res) => {
      this.handleZadarmaCallback(req, res);
    });

    // Endpoint para obtener audios
    this.app.get('/audio/:filename', (req, res) => {
      const audioPath = path.join(__dirname, '../../voice-cache', req.params.filename);

      if (fs.existsSync(audioPath)) {
        res.sendFile(audioPath);
      } else {
        res.status(404).json({ error: 'Audio not found' });
      }
    });

    // Endpoint para iniciar llamada (manual)
    this.app.post('/call/:phoneNumber', async (req, res) => {
      try {
        const phoneNumber = req.params.phoneNumber;
        const from = req.body.from || this.config.zadarma.fromNumber;

        const result = await this.zap.makeCall(phoneNumber, from);

        res.json({
          success: true,
          phoneNumber,
          from,
          result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get active calls status
    this.app.get('/calls/status', (req, res) => {
      res.json({
        active: this.activeCalls.size,
        calls: Array.from(this.activeCalls.entries()).map(([id, call]) => ({
          id,
          phone: call.phone,
          status: call.status,
          started: call.started
        }))
      });
    });
  }

  /**
   * Maneja webhook de Zadarma (eventos de PBX)
   */
  handleZadarmaWebhook(req, res) {
    const data = req.body;
    console.log('📞 Zadarma(Webhook):', JSON.stringify(data, null, 2));

    // Zadarma requiere respuesta rápida
    res.status(200).send('OK');

    // Parsear evento
    const eventType = data.event;

    switch (eventType) {
      case 'NOTIFY_START':
        this.handleCallStarted(data);
        break;
      case 'NOTIFY_INTERNAL':
        this.handleCallInternal(data);
        break;
      case 'NOTIFY_END':
        this.handleCallEnded(data);
        break;
      case 'NOTIFY_VOICE_MAIL':
        this.handleVoicemail(data);
        break;
      default:
        console.log(`🤔 Evento desconocido: ${eventType}`);
    }
  }

  /**
   * Llamada iniciada
   */
  async handleCallStarted(data) {
    console.log('📞 Llamada iniciada:', data);

    const callerId = data.caller_id;
    const calleeId = data.callee_id;
    const callId = data.call_id || `call-${Date.now()}`;

    // Guardar info de llamada
    this.activeCalls.set(callId, {
      phone: calleeId,
      caller: callerId,
      status: 'ringing',
      started: new Date(),
      audioQueue: [],
      speaking: false
    });

    console.log(`✅ Track de llamada iniciada: ${callId}`);
  }

  /**
   * Llamada conectada (cliente contestó)
   */
  async handleCallInternal(data) {
    console.log('✨ Cliente contestó:', data);

    const callId = data.call_id;
    const call = this.activeCalls.get(callId);

    if (call) {
      call.status = 'answered';
      call.answeredTime = new Date();

      // Generar saludo inicial
      const greetingText = await this.ai.generateGreeting('Cliente');
      const greetingAudio = await this.tts.textToSpeech(greetingText);

      call.greetingAudio = greetingAudio;

      console.log(`🗣️ Generé saludo: "${greetingText.substring(0, 50)}..."`);
      console.log(`🎵 Audio: ${greetingAudio}`);
    }
  }

  /**
   * Llamada finalizada
   */
  async handleCallEnded(data) {
    console.log('📞 Llamada finalizada:', data);

    const callId = data.call_id || data.callid;
    const call = this.activeCalls.get(callId);

    if (call) {
      call.endTime = new Date();
      call.duration = call.endTime - call.started;
      call.outcome = call.status === 'answered' ? 'Answered' : 'Not Answered';

      console.log(`📋 Outcome: ${call.outcome}`);
      console.log(`⏱️ Duración: ${(call.duration / 1000).toFixed(2)} seg`);

      // Guardar transcripción si existe
      if (call.transcription) {
        this._saveTranscription(callId, call);
      }

      // Eliminar de llamadas activas
      this.activeCalls.delete(callId);
    }
  }

  /**
   * Email de voz detectado
   */
  async handleVoicemail(data) {
    console.log('📹 Voicemail detectado:', data);

    const callId = data.call_id || data.callid;
    const call = this.activeCalls.get(callId);

    if (call) {
      call.status = 'voicemail';
      call.voicemailTime = new Date();

      // Policy: hangup y move to next
      console.log('⏰ Voicemail policy: hangup and next');
      // Zadarma maneja esto automáticamente según config
    }
  }

  /**
   * Maneja callback de Zadarma (confirmación de initiación)
   */
  handleZadarmaCallback(req, res) {
    const data = req.body;
    console.log('📞 Zadarma(Callback):', JSON.stringify(data, null, 2));

    res.status(200).send('OK');
  }

  /**
   * Guarda transcripción de la llamada
   */
  _saveTranscription(callId, call) {
    const transcriptionDir = path.join(__dirname, '../../transcriptions');

    if (!fs.existsSync(transcriptionDir)) {
      fs.mkdirSync(transcriptionDir, { recursive: true });
    }

    const filename = `transcription-${callId.slice(0, 12)}.txt`;
    const filepath = path.join(transcriptionDir, filename);

    const content = `CALL ID: ${callId}
Phone: ${call.phone}
Duration: ${(call.duration / 1000).toFixed(2)} sec
Outcome: ${call.outcome}
Started: ${call.started}
Ended: ${call.endTime}

TRANSCRIPTION:
${call.transcription ? call.transcription.map(t => `[${t.role}]: ${t.content}`).join('\n') : 'No transcription'}
`;

    fs.writeFileSync(filepath, content);
    console.log(`📝 Transcripción guardada: ${filepath}`);
  }

  /**
   * Inicia servidor
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`✅ Webhook server iniciado en puerto ${this.port}`);
          console.log(`🌐 Webhook URL: https://your-domain.com/zadarma/webhook`);
          console.log(`🔍 Health check: http://localhost:${this.port}/health`);
          resolve();
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.stop());
        process.on('SIGINT', () => this.stop());

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Detiene servidor
   */
  stop() {
    if (this.server) {
      console.log('🛑 Deteniendo webhook server...');
      this.server.close();
    }
  }

  /**
   * Obtiene URL pública del webhook
   */
  getWebhookURL() {
    const domain = this.config.zadarma?.webhookDomain || 'localhost';
    const port = this.port !== 80 && this.port !== 443 ? `:${this.port}` : '';
    return `http${port === '' ? 's' : ''}://${domain}${port}/zadarma/webhook`;
  }
}

module.exports = WebhookServer;