import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { generate } from '../controllers/generateController.js';

const router = Router();

// Rate limit: max 10 generate requests per minute per IP
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many generation requests. Please wait a minute and try again.' },
});

router.post('/', generateLimiter, generate);

export default router;
