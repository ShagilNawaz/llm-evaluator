import { getGeminiClient, GEMINI_MODELS } from "../config/gemini.js";

const MAX_TOKENS = 1024;

const SYSTEM_PROMPT = `
You are a helpful, knowledgeable assistant.
Respond clearly and concisely.
Do not add unnecessary preamble.
Go directly to answering the prompt.
`;

async function callGemini(prompt, temperature) {
  try {
    const genAI = getGeminiClient();

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || GEMINI_MODELS.default,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature,
        maxOutputTokens: MAX_TOKENS
      }
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    return text.trim();

  } catch (error) {
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

// Generate two responses with different temperatures
export async function generateResponses(prompt) {
  console.log("Generating Gemini responses...");

  const [responseA, responseB] = await Promise.all([
    callGemini(prompt, 0.3),
    callGemini(prompt, 0.9)
  ]);

  return {
    responseA,
    responseB,
    provider: "gemini"
  };
}