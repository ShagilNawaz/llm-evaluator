import Groq from 'groq-sdk';

let client = null;

export function getGroqClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set. Get a free key at https://console.groq.com');
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

// Free models on Groq (as of 2025)
// https://console.groq.com/docs/models
export const GROQ_MODELS = {
  fast:    'llama-3.1-8b-instant',    // fastest, lightest
  default: 'llama-3.3-70b-versatile', // recommended — best quality free
  code:    'llama-3.1-70b-versatile', // good for code prompts
};
