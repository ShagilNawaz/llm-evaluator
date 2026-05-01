import { generateResponses } from "../services/aiService.js";

export const generate = async (req, res) => {
  try {
    const { prompt } = req.body;

    const responses = await generateResponses(prompt);

    res.status(200).json({
  success: true,
  responseA: responses.responseA,
  responseB: responses.responseB,
  provider: "gemini"
});

  } catch (err) {
    console.error(`[generate] Provider="gemini" error:`, err.message);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};