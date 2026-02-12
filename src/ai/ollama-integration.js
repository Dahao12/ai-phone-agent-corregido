/**
 * Ollama Integration - LLM LOCAL GRATUITO
 * Reemplaza OpenAI GPT-4 con Llama 3.1 8B (100% gratis)
 */

const axios = require('axios');

class OllamaIntegration {
  constructor(config) {
    this.baseUrl = 'http://localhost:11434/api';
    this.model = config.ollama?.model || 'llama3.1:8b';
    this.temperature = config.ollama?.temperature || 0.7;
    this.callScript = null;
  }

  /**
   * Configura el guion de llamada
   */
  setCallScript(script) {
    this.callScript = script;
    console.log('✅ Guion de llamada configurado en Ollama');
  }

  /**
   * GPT-4 Chat Alternativo - Llama 3.1 8B
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Construir prompt de sistema
      let systemPrompt = this._getSystemPrompt();

      // Añadir guion si existe
      if (this.callScript) {
        systemPrompt += `\n\nGUION BASE:\n${this.callScript}`;
      }

      // Formatear mensajes para Ollama
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await axios.post(
        `${this.baseUrl}/chat`,
        {
          model: this.model,
          messages: formattedMessages,
          stream: false,
          options: {
            temperature: options.temperature || this.temperature,
            num_predict: options.maxTokens || 150
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const reply = response.data.message?.content || '';
      console.log(`🤖 Ollama: "${reply.substring(0, 100)}..."`);
      return reply;

    } catch (error) {
      console.error('Error en Ollama Chat:', error.response?.data || error.message);

      // Fallback: Respuesta por defecto si Ollama falla
      return this._getDefaultResponse();
    }
  }

  /**
   * Prompt de sistema para Llama 3.1
   */
  _getSystemPrompt() {
    let systemPrompt = `ERES UN ASESOR DE VENTAS PROFESIONAL DE ENERLUX SOLUCIONES, empresa de energía renovable en España.

TUS RESPONSABILIDADES:
1. Llamada profesional y respetuosa
2. Ofrecer servicios de energía (electricidad + gas)
3. Identificar interés del cliente
4. Manejar objeciones con empatía
5. Ser conciso (máximo 20 palabras por respuesta)

ESTILO DE COMUNICACIÓN:
- Profesional pero cercano
- No agresivo ni insistente
- Escuchar activamente
- Proporcionar información clara
- Español de España

OBJETIVO:
Detectar si el cliente tiene inter�s en cambiar de proveedor de energía.
Si SÍ → Preguntar más específicamente sobre su situación.
Si NO → Aceptar rechazo y agradecer amablemente.

RESPONDEN EN ESPAÑOL, MÁXIMO 20 PALABRAS.
`;

    return systemPrompt;
  }

  /**
   * Respuesta por defecto si Ollama falla
   */
  _getDefaultResponse() {
    const defaults = [
      'Perfecto, le entiendo. ¿Le gustaría más información?',
      'Claro, le explico. ¿Cómo le gustaría proseguir?',
      'Entiendo, ¿Algún momento que le convenga hablar?',
      'De nada, si tiene dudas me puede llamar. Un día.'
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  /**
   * Genera saludo inicial
   */
  async generateGreeting(clientName) {
    const messages = [
      {
        role: 'user',
        content: `Genera saludo inicial profesional para llamar a ${clientName}. Presenta Enerlux Soluciones y propósito de llamada. MÁXIMO 25 palabras.`
      }
    ];

    return await this.chatCompletion(messages, { maxTokens: 30 });
  }

  /**
   * Analiza respuesta del cliente
   */
  async analyzeClientResponse(clientResponse, clientName) {
    const messages = [
      {
        role: 'user',
        content: `El cliente ${clientName} respondió: "${clientResponse}"

Genera respuesta profesional de asesor energético. Máximo 30 palabras. Si interesado, pregunta más. Si rechazó, agradece amablemente.`
      }
    ];

    return await this.chatCompletion(messages, { maxTokens: 40 });
  }

  /**
   * Determina outcome de llamada
   */
  async determineCallOutcome(conversationHistory) {
    const messages = [
      {
        role: 'user',
        content: `Basado en esta conversación, determina si el cliente está INTERESTED o NOT_INTERESTED.

CONVERSACIÓN:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Responde solo una palabra: INTERESTED o NOT_INTERESTED`
      }
    ];

    try {
      const result = await this.chatCompletion(messages, { maxTokens: 5, temperature: 0.1 });
      return result.trim().toUpperCase().includes('INTERESTED') ? 'Interested' : 'Not Interested';
    } catch (error) {
      return 'Not Interested';
    }
  }

  /**
   * Verifica que Ollama está disponible
   */
  async checkConnection() {
    try {
      const response = await axios.get('http://localhost:11434/api/tags');
      console.log('✅ Ollama está disponible');
      console.log(`📦 Modelos disponibles: ${response.data.models?.map(m => m.name).join(', ')}`);
      return true;
    } catch (error) {
      console.error('❌ Ollama no está disponible:', error.message);
      return false;
    }
  }
}

module.exports = OllamaIntegration;