/**
 * gTTS Integration - Text-to-Speech GRATUITO
 * Google Text-to-Speech (100% gratis)
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

class GTTSIntegration {
  constructor(config) {
    this.lang = config.gtts?.lang || 'es';
    this.tld = config.gtts?.tld || 'es'; // top-level domain (es = España)
    this.slow = config.gtts?.slow || false; // velocidad normal
    this.voiceCache = path.join(__dirname, '../../voice-cache');
    this.pythonPath = path.join(__dirname, '../../tts-env/bin/python');

    // Crear directorio de cache
    if (!fs.existsSync(this.voiceCache)) {
      fs.mkdirSync(this.voiceCache, { recursive: true });
    }
  }

  /**
   * Genera audio de voz usando gTTS (Python)
   * @param {string} text - Texto a convertir
   * @param {string} outputPath - Ruta del archivo de audio
   * @returns {Promise<string>} - Ruta del archivo generado
   */
  async textToSpeech(text, outputPath = null) {
    let finalPath = outputPath;

    if (!finalPath) {
      const timestamp = Date.now();
      finalPath = path.join(this.voiceCache, `voice-${timestamp}.mp3`);
    }

    try {
      // Escapar texto para shell (comillas, espacios, etc)
      const escapedText = text.replace(/'/g, "'\\''");

      // Python script para gTTS
      const pythonCode = `
from gtts import gTTS
import sys

text = '''${escapedText}'''
lang = '${this.lang}'
tld = '${this.tld}'
slow = ${this.slow}

try:
    tts = gTTS(text=text, lang=lang, tld=tld, slow=slow)
    tts.save('${finalPath}')
    print('SUCCESS')
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
`;

      // Ejecutar con Python en entorno virtual
      const command = `echo "${pythonCode.replace(/"/g, '\\"')}" | ${this.pythonPath}`;

      const result = await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }

          if (stdout.includes('ERROR')) {
            reject(new Error(stdout));
            return;
          }

          resolve(stdout);
        });
      });

      console.log(`✅ Audio generado: ${finalPath}`);
      console.log(`🗣️ Texto: "${text.substring(0, 50)}..."`);

      if (fs.existsSync(finalPath)) {
        const stats = fs.statSync(finalPath);
        console.log(`📦 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
      }

      return finalPath;

    } catch (error) {
      console.error('❌ Error en gTTS:', error.message);

      // Fallback: Respuesta por defecto
      return this._generateSilence(finalPath);
    }
  }

  /**
   * Genera silencio (fallback si gTTS falla)
   */
  _generateSilence(outputPath) {
    const silencePath = path.join(this.voiceCache, 'silence.mp3');

    if (!fs.existsSync(silencePath)) {
      // Generar silencio de 0.5 segundos usando ffmpeg
      const ffmpegCommand = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame ${silencePath} -y`;

      try {
        require('child_process').execSync(ffmpegCommand, { stdio: 'ignore' });
      } catch (error) {
        console.warn('⚠️ No se pudo generar silencio');
        return null;
      }
    }

    if (outputPath && fs.existsSync(silencePath)) {
      fs.copyFileSync(silencePath, outputPath);
      return outputPath;
    }

    return silencePath;
  }

  /**
   * Genera saludo inicial
   */
  async generateGreeting(clientName) {
    const text = `Hola, soy de Enerlux Soluciones, llamo para ofrecerle energía renovable.`;
    return await this.textToSpeech(text);
  }

  /**
   * Genera respuesta de IA
   */
  async generateAIResponse(aiText) {
    return await this.textToSpeech(aiText);
  }

  /**
   * Genera cierre de llamada
   */
  async generateClosing() {
    const text = `Muchas gracias por su tiempo, que tenga un buen día.`;
    return await this.textToSpeech(text);
  }

  /**
   * Limpia cache de voz (archivos antiguos)
   */
  clearVoiceCache(maxAge = 3600000) { // 1 hora por defecto
    try {
      const files = fs.readdirSync(this.voiceCache);
      const now = Date.now();

      files.forEach(file => {
        const filePath = path.join(this.voiceCache, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Borrado archivo antiguo: ${file}`);
        }
      });
    } catch (error) {
      console.log('Error limpiando cache:', error.message);
    }
  }

  /**
   * Verifica que gTTS está disponible
   */
  async checkConnection() {
    try {
      const testAudio = await this.textToSpeech('Prueba', path.join(this.voiceCache, 'test.mp3'));

      if (testAudio && fs.existsSync(testAudio)) {
        console.log('✅ gTTS está funcionando correctamente');

        // Borrar test
        fs.unlinkSync(testAudio);

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ gTTS no está disponible:', error.message);
      return false;
    }
  }

  /**
   * Obtiene información del sistema de voz
   */
  getVoiceInfo() {
    return {
      provider: 'gTTS (Google Text-to-Speech)',
      lang: this.lang,
      tld: this.tld,
      slow: this.slow,
      cache: this.voiceCache,
      cost: 'FREE'
    };
  }
}

module.exports = GTTSIntegration;