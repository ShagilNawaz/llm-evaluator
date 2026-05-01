import { Router } from 'express';
import {
  saveEvaluation,
  listEvaluations,
  analyticsEvaluations,
  exportEvaluations,
} from '../controllers/evaluationController.js';

const router = Router();

// POST   /api/evaluate       → save new evaluation
router.post('/', saveEvaluation);

// GET    /api/evaluations/analytics  → aggregate stats  (must be before /:id)
router.get('/analytics', analyticsEvaluations);

// GET    /api/evaluations/export     → download JSON
router.get('/export', exportEvaluations);

// GET    /api/evaluations            → paginated list
router.get('/', listEvaluations);

export default router;
