# Configuración para Windows

## Editar el archivo config\config.json

### Contenido correcto:

```json
{
  "zadarma": {
    "apiKey": "e44e9700107ae400f471",
    "secret": "8acc083f9511f2ca9c2c",
    "fromNumber": "+34936941917"
  },
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "model": "llama3.1:8b",
    "temperature": 0.7
  },
  "gtts": {
    "lang": "es",
    "tld": "es",
    "slow": false
  },
  "clients": {
    "csvPath": "C:\\ai-phone-agent-corregido\\clients.csv"
  }
}
```

### ⚠️ Importante:

1. **apiKey y secret**: Deben ser tus credenciales de Zadarma
2. **fromNumber**: Tu número de salida (+34936941917)
3. **csvPath**: Ruta completa a clients.csv
4. **Ollama**: Debe estar ejecutándose antes de usar el sistema

### Para ejecutar Ollama:

En otra terminal de PowerShell:
```powershell
ollama serve
```

Deja esa ventana abierta y ejecuta el phone agent en otra ventana.