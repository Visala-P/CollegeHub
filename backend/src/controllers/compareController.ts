import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { connectDatabase, getCollections, nextSequence } from '../db/config.js';

const normalizeCollegeIds = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as number[];
  }

  return value
    .map((collegeId) => Number.parseInt(String((collegeId as any)?.id ?? collegeId), 10))
    .filter((collegeId) => Number.isFinite(collegeId));
};

const fetchCollegesByIds = async (collegeIds: number[]) => {
  await connectDatabase();
  const { colleges } = getCollections();

  const documents = await colleges.find({ id: { $in: collegeIds } }).toArray();
  const order = new Map(collegeIds.map((collegeId, index) => [collegeId, index]));

  return documents.sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
};

export const saveComparison = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const collegeIds = normalizeCollegeIds(req.body.collegeIds ?? req.body.colleges);

    if (collegeIds.length < 2 || collegeIds.length > 3) {
      return res.status(400).json({ message: 'Please select 2-3 colleges' });
    }

    const colleges = await fetchCollegesByIds(collegeIds);

    if (colleges.length !== collegeIds.length) {
      const foundIds = new Set(colleges.map((college) => college.id));
      const missingCollegeId = collegeIds.find((collegeId) => !foundIds.has(collegeId));

      if (missingCollegeId != null) {
        return res.status(404).json({ message: `College ${missingCollegeId} not found` });
      }
    }

    await connectDatabase();
    const { comparisons } = getCollections();

    const comparison = {
      id: await nextSequence('comparisons'),
      user_id: req.user.id,
      college_ids: collegeIds,
      created_at: new Date().toISOString(),
    };

    await comparisons.insertOne(comparison);

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

    await connectDatabase();
    const { comparisons } = getCollections();

    const userComparisons = await comparisons
      .find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .toArray();

    const result = await Promise.all(
      userComparisons.map(async (comparison) => ({
        id: comparison.id,
        colleges: await fetchCollegesByIds(comparison.college_ids ?? []),
        createdAt: comparison.created_at,
      })),
    );

    res.json(result);
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

    await connectDatabase();
    const { comparisons } = getCollections();

    const comparisonId = Number.parseInt(req.params.id, 10);

    const result = await comparisons.deleteOne({ id: comparisonId, user_id: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error('Delete comparison error:', error);
    res.status(500).json({ message: 'Failed to delete comparison' });
  }
};

export const compareColleges = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== 'string') {
      return res.status(400).json({ message: 'College IDs are required' });
    }

    const collegeIds = ids
      .split(',')
      .map((id) => Number.parseInt(id, 10))
      .filter((collegeId) => Number.isFinite(collegeId));

    const colleges = await fetchCollegesByIds(collegeIds);

    if (colleges.length === 0) {
      return res.status(404).json({ message: 'No valid colleges found' });
    }

    res.json(colleges);
  } catch (error) {
    console.error('Compare colleges error:', error);
    res.status(500).json({ message: 'Failed to compare colleges' });
  }
};