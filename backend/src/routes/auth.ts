import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  saveCollege,
  unsaveCollege,
  getSavedColleges,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.post('/save-college', authMiddleware, saveCollege);
router.post('/unsave-college', authMiddleware, unsaveCollege);
router.get('/saved-colleges', authMiddleware, getSavedColleges);

export default router;
