import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { getCollegeById } from '../services/localCollegeData.js';

interface SavedComparison {
  id: number;
  userId: number;
  collegeIds: string[];
  createdAt: string;
}

const savedComparisons: SavedComparison[] = [];
let comparisonIdCounter = 1;

export const saveComparison = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { collegeIds } = req.body;

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length < 2 || collegeIds.length > 3) {
      return res.status(400).json({ message: 'Please select 2-3 colleges' });
    }

    for (const collegeId of collegeIds) {
      const college = getCollegeById(String(collegeId));
      if (!college) {
        return res.status(404).json({ message: `College ${collegeId} not found` });
      }
    }

    const comparison: SavedComparison = {
      id: comparisonIdCounter++,
      userId: req.user.id,
      collegeIds: collegeIds.map(String),
      createdAt: new Date().toISOString(),
    };

    savedComparisons.push(comparison);

    res.json({ message: 'Comparison saved successfully', id: comparison.id });
  } catch (error) {
    console.error('Save comparison error:', error);
    res.status(500).json({ message: 'Failed to save comparison' });
  }
};

export const getComparisons = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userComparisons = savedComparisons
      .filter(c => c.userId === req.user!.id)
      .map(c => ({
        id: c.id,
        colleges: c.collegeIds.map(id => getCollegeById(id)).filter(Boolean),
        createdAt: c.createdAt,
      }));

    res.json(userComparisons);
  } catch (error) {
    console.error('Get comparisons error:', error);
    res.status(500).json({ message: 'Failed to fetch comparisons' });
  }
};

export const deleteComparison = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const comparisonId = Number.parseInt(id, 10);

    const index = savedComparisons.findIndex(
      c => c.id === comparisonId && c.userId === req.user!.id
    );

    if (index === -1) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    savedComparisons.splice(index, 1);

    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('Delete comparison error:', error);
    res.status(500).json({ message: 'Failed to delete comparison' });
  }
};

export const compareColleges = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: 'College IDs are required' });
    }

    const collegeIds = (ids as string).split(',').map(String);

    const colleges = collegeIds
      .map(id => getCollegeById(id))
      .filter(Boolean);

    if (colleges.length === 0) {
      return res.status(404).json({ message: 'No valid colleges found' });
    }

    res.json(colleges);
  } catch (error) {
    console.error('Compare colleges error:', error);
    res.status(500).json({ message: 'Failed to compare colleges' });
  }
};