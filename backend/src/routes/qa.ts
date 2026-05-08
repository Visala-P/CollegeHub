import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  answerQuestion,
  upvoteAnswer,
  searchQuestions,
} from '../controllers/qaController.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Get all questions
router.get('/', optionalAuth, getQuestions);

// Search questions
router.get('/search', optionalAuth, searchQuestions);

// Get single question
router.get('/:id', optionalAuth, getQuestionById);

// Create question (optional auth)
router.post('/', optionalAuth, createQuestion);

// Post answer to question (optional auth)
router.post('/answer', optionalAuth, answerQuestion);

// Upvote answer (optional auth)
router.post('/upvote', optionalAuth, upvoteAnswer);

export default router;
