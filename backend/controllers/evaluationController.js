import {
  createEvaluation,
  getEvaluations,
  getAllEvaluations,
  getAnalytics,
} from '../services/evaluationService.js';

/**
 * POST /api/evaluate
 * Save a completed evaluation to MongoDB.
 */
export async function saveEvaluation(req, res) {
  const {
    prompt, responseA, responseB,
    scoresA, scoresB,
    verdict, justification, evaluatorName,
  } = req.body;

  // Basic presence validation
  const required = { prompt, responseA, responseB, scoresA, scoresB, verdict, justification, evaluatorName };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  if (justification.trim().length < 20) {
    return res.status(400).json({ error: 'Justification must be at least 20 characters.' });
  }

  try {
    const evaluation = await createEvaluation({
      prompt: prompt.trim(),
      responseA,
      responseB,
      scoresA,
      scoresB,
      verdict,
      justification: justification.trim(),
      evaluatorName: evaluatorName.trim(),
    });

    return res.status(201).json(evaluation);
  } catch (err) {
    console.error('[saveEvaluation] Error:', err);

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }

    return res.status(500).json({ error: 'Failed to save evaluation.' });
  }
}

/**
 * GET /api/evaluations
 * Returns paginated list of evaluations.
 * Query params: page, limit
 */
export async function listEvaluations(req, res) {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);

  try {
    const result = await getEvaluations({ page, limit });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[listEvaluations] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch evaluations.' });
  }
}

/**
 * GET /api/evaluations/analytics
 * Returns aggregated analytics data.
 */
export async function analyticsEvaluations(req, res) {
  try {
    const data = await getAnalytics();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[analyticsEvaluations] Error:', err);
    return res.status(500).json({ error: 'Failed to compute analytics.' });
  }
}

/**
 * GET /api/evaluations/export
 * Returns all evaluations as a JSON file download.
 */
export async function exportEvaluations(req, res) {
  try {
    const evaluations = await getAllEvaluations();
    const filename = `llm-evaluations-${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).json({ exported: evaluations.length, evaluations });
  } catch (err) {
    console.error('[exportEvaluations] Error:', err);
    return res.status(500).json({ error: 'Failed to export evaluations.' });
  }
}
