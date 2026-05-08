import { Router } from 'express';
import {
  predict,
  getAvailableExams,
} from '../controllers/predictorController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get available exams
router.get('/exams', optionalAuth, getAvailableExams);

// Predict colleges based on exam and rank
router.post('/predict', optionalAuth, predict);

export default router;
