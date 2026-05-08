import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import {
  getCollegesByPage,
  searchColleges,
  getCollegeById,
  getFilters,
  filterColleges,
} from '../services/localCollegeData.js';

export const getColleges = async (req: AuthRequest, res: Response) => {
  const {
    page = '1',
    limit = '6',
    search = '',
    state = '',
    course = '',
    minFees = '',
    maxFees = '',
  } = req.query;

  try {
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    let result;

    if (search && typeof search === 'string' && search.trim()) {
      result = searchColleges(search, pageNumber, pageSize);
    } else if (state || course || minFees || maxFees) {
      result = filterColleges({
        state: state as string,
        course: course as string,
        minFees: minFees ? parseInt(minFees as string, 10) : undefined,
        maxFees: maxFees ? parseInt(maxFees as string, 10) : undefined,
      }, pageNumber, pageSize);
    } else {
      result = getCollegesByPage(pageNumber, pageSize);
    }

    res.json(result);
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ message: 'Error retrieving colleges' });
  }
};

export const getCollegeByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const college = getCollegeById(id);

    if (college) {
      res.json(college);
    } else {
      res.status(404).json({ message: 'College not found' });
    }
  } catch (error) {
    console.error('Get college by ID error:', error);
    res.status(500).json({ message: 'Error retrieving college' });
  }
};

export const searchCollegesController = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const result = searchColleges(query, 1, 20);
    res.json(result.data);
  } catch (error) {
    console.error('Search colleges error:', error);
    res.status(500).json({ message: 'Error searching colleges' });
  }
};

export const getFiltersController = async (req: AuthRequest, res: Response) => {
  try {
    const filters = getFilters();
    res.json(filters);
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Error retrieving filters' });
  }
};