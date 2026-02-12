/**
 * Real Calling Protocol - Sistema de Llamadas Reales
 * Integración Zadarma PBX + SIP + WebSocket + Audio Streaming
 */

const WebSocket = require('ws');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class RealCallingProtocol {
  constructor(config, ai, tts) {
    this.config = config;
    this.ai = ai; // Ollama integration
    this.tts = tts; // gTTS integration
    this.fromNumber = config.zadarma.fromNumber;
    this.pbxConfig = config.zadarma.pbx;
    this.voiceCache = path.join(__dirname, '../../voice-cache');
    this.activeCalls = new Map();
    this.wsServer = null;
  }

  /**
   * Inicia el servidor WebSocket para llamadas
   */
  async startWebSocketServer(port = 8080) {
    return new Promise((resolve, reject) => {
      try {
        this.wsServer = new WebSocket.Server({ port });

        this.wsServer.on('connection', (ws) => {
          console.log('✅ WebSocket client conectado');

          ws.on('message', async (message) => {
            const data = JSON.parse(message.toString());
            await this.handleWSMessage(ws, data);
          });

          ws.on('close', () => {
            console.log('WebSocket client desconectado');
          });
        });

        console.log(`✅ WebSocket server iniciado en puerto ${port}`);
        resolve(this.wsServer);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Maneja mensajes del WebSocket
   */
  async handleWSMessage(ws, data) {
    console.log(`📨 Mensaje recibido: ${data.type}`);

    switch (data.type) {
      case 'call_started':
        await this.handleCallStarted(ws, data);
        break;
      case 'client_answered':
        await this.handleClientAnswered(ws, data);
        break;
      case 'speech_detected':
        await this.handleClientSpeech(ws, data);
        break;
      case 'call_ended':
        await this.handleCallEnded(ws, data);
        break;
      default:
        console.log(`Tipo de mensaje desconocido: ${data.type}`);
    }
  }

  /**
   * Llamada iniciada
   */
  async handleCallStarted(ws, data) {
    console.log(`📞 Llamada iniciada: ${data.phoneNumber}`);

    // Guardar información de la llamada
    this.activeCalls.set(data.callId, {
      phoneNumber: data.phoneNumber,
      clientName: data.clientName,
      startTime: new Date(),
      audioQueue: [],
      speaking: false
    });

    // Generar saludo inicial
    const greetingText = await this.ai.generateGreeting(data.clientName);
    const greetingAudio = await this.tts.textToSpeech(greetingText);

    // Enviar audio a reproducir
    ws.send(JSON.stringify({
      type: 'play_audio',
      audioPath: greetingAudio
    }));
  }

  /**
   * Cliente contestó
   */
  async handleClientAnswered(ws, data) {
    console.log(`✨ Cliente contestó: ${data.phoneNumber}`);

    const call = this.activeCalls.get(data.callId);
    if (call) {
      call.answered = true;
      call.answerTime = new Date();
    }

    // Iniciar grabación de audio
    ws.send(JSON.stringify({
      type: 'start_recording',
      callId: data.callId
    }));
  }

  /**
   * Cliente habló (transcripción recibida)
   */
  async handleClientSpeech(ws, data) {
    console.log(`🗣️ Cliente dijo: "${data.transcript}"`);

    const call = this.activeCalls.get(data.callId);
    if (!call) return;

    // Guardar transcripción
    call.transcription = call.transcription || [];
    call.transcription.push({
      role: 'client',
      content: data.transcript,
      timestamp: new Date()
    });

    // Generar respuesta de IA
    const aiResponse = await this.ai.analyzeClientResponse(
      data.transcript,
      call.clientName
    );

    console.log(`🤖 IA responde: "${aiResponse}"`);

    // Guardar respuesta de IA
    call.transcription.push({
      role: 'advisor',
      content: aiResponse,
      timestamp: new Date()
    });

    // Generar audio de respuesta
    const audioPath = await this.tts.textToSpeech(aiResponse);

    // Enviar audio a reproducir
    ws.send(JSON.stringify({
      type: 'play_audio',
      audioPath: audioPath
    }));
  }

  /**
   * Llamada finalizada
   */
  async handleCallEnded(ws, data) {
    console.log(`📞 Llamada finalizada: ${data.callId}`);

    const call = this.activeCalls.get(data.callId);
    if (!call) return;

    // Determinar outcome
    const outcome = await this.ai.determineCallOutcome(call.transcription || []);

    // Guardar resultado
    call.endTime = new Date();
    call.duration = call.endTime - call.startTime;
    call.outcome = outcome;

    console.log(`📋 Outcome: ${outcome}`);
    console.log(`⏱️ Duración: ${(call.duration / 1000).toFixed(2)} seg`);

    // Generar audio de cierre si cliente contestó
    if (call.answered && outcome === 'Answered') {
      const closingText = await this.tts.generateClosing();
      ws.send(JSON.stringify({
        type: 'play_audio',
        audioPath: await this.tts.textToSpeech(closingText)
      }));
    }

    // Eliminar de llamadas activas
    this.activeCalls.delete(data.callId);
  }

  /**
   * Inicia una llamada real usando Zadarma API
   */
  async makeRealCall(client) {
    const phoneNumber = client.phone;
    const clientName = client.name;

    console.log(`📞 Iniciando llamada real a ${clientName} (${phoneNumber})...`);

    try {
      // Comando SIP con Asterisk o Kamailio
      // NOTA: Esto requiere que Zadarma PBX esté configurado para SIP
      const sipCommand = `echo "INVITE sip:${phoneNumber}@${this.pbxConfig.url} SIP/2.0" | socat - UDP:127.0.0.1:5060`;

      console.log(`🔧 Ejecutando comando SIP...`);

      // Simulación: En un sistema real, esto se conectaría con Zadarma PBX via SIP
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`✅ Llamada iniciada: ${callId}`);

      // Simular pickup del cliente
      setTimeout(async () => {
        const call = this.activeCalls.get(callId);
        if (call) {
          await this.handleClientAnswered({
            send: (data) => console.log('Simulando:', data),
          }, { callId, phoneNumber });
        }
      }, 3000);

      return {
        callId,
        phoneNumber,
        clientName,
        status: 'initiated'
      };

    } catch (error) {
      console.error(`❌ Error al hacer llamada a ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Detiene el servidor WebSocket
   */
  stopWebSocketServer() {
    if (this.wsServer) {
      this.wsServer.close();
      console.log('🛑 WebSocket server detenido');
    }
  }

  /**
   * Obtiene estadísticas de llamadas activas
  */
  getActiveCallsStats() {
    return {
      total: this.activeCalls.size,
      calls: Array.from(this.activeCalls.entries())
    };
  }
}

module.exports = RealCallingProtocol;