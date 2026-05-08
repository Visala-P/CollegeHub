import { Router } from 'express';
import {
  saveComparison,
  getComparisons,
  compareColleges,
  deleteComparison,
} from '../controllers/compareController.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Compare colleges (no auth needed)
router.get('/', optionalAuth, compareColleges);

// Save comparison (requires auth)
router.post('/save', authMiddleware, saveComparison);

// Get saved comparisons (requires auth)
router.get('/saved', authMiddleware, getComparisons);

// Delete saved comparison (requires auth)
router.delete('/saved/:id', authMiddleware, deleteComparison);

export default router;
