import { Router } from 'express';
import {
  getColleges,
  getCollegeByIdController,
  searchCollegesController,
  getFiltersController,
} from '../controllers/collegeController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getColleges);

router.get('/filters', optionalAuth, getFiltersController);

router.get('/search', optionalAuth, searchCollegesController);

router.get('/:id', optionalAuth, getCollegeByIdController);

export default router;