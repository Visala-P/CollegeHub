import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { connectDatabase, getCollections } from '../db/config.js';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseNumber = (value: unknown) => {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePage = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildCollegeQuery = (query: AuthRequest['query']) => {
  const mongoQuery: Record<string, unknown> = {};
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const state = typeof query.state === 'string' ? query.state.trim() : '';
  const course = typeof query.course === 'string' ? query.course.trim() : '';
  const minFees = parseNumber(query.minFees);
  const maxFees = parseNumber(query.maxFees);

  if (search) {
    mongoQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { state: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { courses: { $elemMatch: { $regex: search, $options: 'i' } } },
    ];
  }

  if (state) {
    mongoQuery.state = state;
  }

  if (course) {
    mongoQuery.courses = {
      $elemMatch: { $regex: `^${escapeRegex(course)}$`, $options: 'i' },
    };
  }

  if (minFees != null || maxFees != null) {
    mongoQuery.fees = {} as Record<string, number>;

    if (minFees != null) {
      (mongoQuery.fees as Record<string, number>).$gte = minFees;
    }

    if (maxFees != null) {
      (mongoQuery.fees as Record<string, number>).$lte = maxFees;
    }
  }

  return mongoQuery;
};

export const getColleges = async (req: AuthRequest, res: Response) => {
  try {
    await connectDatabase();

    const page = parsePage(req.query.page, 1);
    const limit = parsePage(req.query.limit, 6);
    const collections = getCollections();
    const mongoQuery = buildCollegeQuery(req.query);

    const colleges = await collections.colleges
      .find(mongoQuery)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await collections.colleges.countDocuments(mongoQuery);

    res.json({
      data: colleges,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({
      message: 'Error retrieving colleges',
    });
  }
};

export const getCollegeByIdController = async (req: AuthRequest, res: Response) => {
  try {
    await connectDatabase();

    const collections = getCollections();
    const college = await collections.colleges.findOne({
      id: parseInt(req.params.id, 10),
    });

    if (!college) {
      return res.status(404).json({
        message: 'College not found',
      });
    }

    res.json(college);
  } catch (error) {
    console.error('Get college by ID error:', error);
    res.status(500).json({
      message: 'Error retrieving college',
    });
  }
};

export const searchCollegesController = async (req: AuthRequest, res: Response) => {
  try {
    await connectDatabase();

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        message: 'Search query is required',
      });
    }

    const collections = getCollections();
    const search = query.trim();

    const colleges = await collections.colleges
      .find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { courses: { $elemMatch: { $regex: search, $options: 'i' } } },
        ],
      })
      .sort({ name: 1 })
      .limit(20)
      .toArray();

    res.json(colleges);
  } catch (error) {
    console.error('Search colleges error:', error);
    res.status(500).json({
      message: 'Error searching colleges',
    });
  }
};

export const getFiltersController = async (req: AuthRequest, res: Response) => {
  try {
    await connectDatabase();

    const collections = getCollections();
    const states = await collections.colleges.distinct('state');
    const courses = await collections.colleges.distinct('courses');

    res.json({
      states: states.sort(),
      courses: courses.sort(),
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({
      message: 'Error retrieving filters',
    });
  }
};