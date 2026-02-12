/**
 * OpenAI Integration
 * GPT-4 (Chat), Whisper (Speech-to-Text), TTS (Text-to-Speech)
 */

const fs = require('fs');
const axios = require('axios');

class OpenAIIntegration {
  constructor(config) {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.model;
    this.ttsModel = config.openai.ttsModel;
    this.ttsVoice = config.openai.ttsVoice;
    this.whisperModel = config.openai.whisperModel;
    this.baseUrl = 'https://api.openai.com/v1';

    // Guion base de la conversación (se llenará después de transcribir audios)
    this.callScript = null;
  }

  /**
   * Configura el guion de llamada
   */
  setCallScript(script) {
    this.callScript = script;
    console.log('✅ Guion de llamada configurado');
  }

  /**
   * GPT-4 Chat - Genera respuesta inteligente durante llamada
   */
  async chatCompletion(messages, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this._getSystemPrompt()
            },
            ...messages
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 150,
          ...options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error en GPT-4 Chat:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * TTS - Convierte texto a audio (voz humana)
   */
  async textToSpeech(text, outputPath = null) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/audio/speech`,
        {
          model: this.ttsModel,
          input: text,
          voice: this.ttsVoice,
          response_format: 'mp3'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      if (outputPath) {
        fs.writeFileSync(outputPath, Buffer.from(response.data));
        console.log(`✅ Audio generado: ${outputPath}`);
      }

      return response.data;
    } catch (error) {
      console.error('Error en TTS:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Whisper - Transcribe audio a texto
   */
  async speechToText(audioFile, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFile));
      formData.append('model', this.whisperModel);
      formData.append('language', options.language || 'es');

      const response = await axios.post(
        `${this.baseUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('✅ Transcripción completada');
      return response.data.text;
    } catch (error) {
      console.error('Error en Whisper:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene el prompt de sistema para GPT-4
   */
  _getSystemPrompt() {
    let systemPrompt = `Eres un asesor de ventas profesional de Enerlux Soluciones, una empresa de energía renovable en España.

TUS RESPONSABILIDADES:
1. Llamada profesional y respetuosa
2. Ofrecer servicios de energía (electricidad + gas)
3. Interrogar si el cliente está interesado
4. Manejar objeciones con empatía

ESTILO DE COMUNICACIÓN:
- Profesional pero cercano
- No agresivo ni insistente
- Escuchar activamente
- Proporcionar información clara

OBJETIVO:
Identificar si el cliente está interesado en cambiar de proveedor de energía.
Si SÍ → Marcar como "Interested" y pedir seguimiento.
Si NO → Aceptar rechazo y agradecer.
`;

    if (this.callScript) {
      systemPrompt += `\n\nGUION BASE:\n${this.callScript}`;
    }

    return systemPrompt;
  }

  /**
   * Genera respuesta inicial de bienvenida
   */
  async generateGreeting(clientName) {
    const messages = [
      {
        role: 'user',
        content: `Genera una saludo inicial profesional para llamar a ${clientName}. El saludo debe ser breve, cordial y presentar el propósito de la llamada.`
      }
    ];

    return await this.chatCompletion(messages, { maxTokens: 50 });
  }

  /**
   * Analiza respuesta del cliente
   */
  async analyzeClientResponse(clientResponse, clientName) {
    const messages = [
      {
        role: 'user',
        content: `El cliente ${clientName} ha respondido: "${clientResponse}"

Analiza esta respuesta y genera una continuación profesional de la conversación.
Si el cliente parece interesado, haz preguntas más específicas sobre su situación energética.
Si el cliente no está interesado, acepta su rechazo amablemente.
`
      }
    ];

    return await this.chatCompletion(messages);
  }

  /**
   * Determina el outcome final de la llamada
   */
  async determineCallOutcome(conversationHistory) {
    const messages = [
      {
        role: 'user',
        content: `Basado en esta conversación de llamada, determina si el cliente está INTERESTED o NOT INTERESTED.

CONVERSACIÓN:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Responde solo con una de estas dos palabras:
- INTERESTED (si mostró interés de cambiar proveedor)
- NOT_INTERESTED (si rechazó o no mostró interés)
`
      }
    ];

    try {
      const result = await this.chatCompletion(messages, { maxTokens: 5, temperature: 0.1 });
      return result.trim().toUpperCase() === 'INTERESTED' ? 'Interested' : 'Not Interested';
    } catch (error) {
      return 'Not Interested';
    }
  }
}

module.exports = OpenAIIntegration;