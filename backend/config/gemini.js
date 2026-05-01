import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;

export function getGeminiClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Get a free key at https://aistudio.google.com/app/apikey');
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// Free models on Gemini (as of 2025)
export const GEMINI_MODELS = {
  default: "gemini-2.5-flash"
};
