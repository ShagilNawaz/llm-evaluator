// Ollama runs locally — no API key needed
// Install: https://ollama.com/download
// Pull a model first: ollama pull llama3.2

export const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export const OLLAMA_MODELS = {
  fast:    'llama3.2',     // 3B — fast on most machines
  default: 'llama3.2',    // recommended
  large:   'llama3.1:8b', // better quality, needs more RAM
  code:    'codellama',   // good for code-related prompts
};

export async function checkOllamaRunning() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}
