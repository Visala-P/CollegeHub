import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { loadAllColleges, type CollegeData } from '../services/localCollegeData.js';

type PredictionCollege = CollegeData & {
  match: 'Safe' | 'Moderate' | 'Tough';
  probability: number;
  closingRank: number;
  openingRank: number;
};

const normalizeExam = (exam: string) => exam.trim().toLowerCase();

const isIitCollege = (college: CollegeData) => /\biit\b|indian institute of technology/i.test(college.name);

const scoreIitCollege = (college: CollegeData, rank: number, exam: string): PredictionCollege | null => {
  if (!exam.toLowerCase().includes('advanced')) {
    return null;
  }

  if (rank > 30000) {
    return null;
  }

  const openingRank = Math.max(1, Math.min(college.minRank, college.maxRank));
  const closingRank = Math.max(openingRank, college.maxRank);

  const safeThreshold = closingRank - 500;
  const moderateUpper = closingRank + 500;

  let match: PredictionCollege['match'] = 'Tough';
  let probability = 60;

  if (rank <= safeThreshold) {
    match = 'Safe';
    probability = 90;
  } else if (rank <= moderateUpper) {
    match = 'Moderate';
    probability = 72;
  } else {
    match = 'Tough';
    probability = 40;
  }

  return {
    ...college,
    match,
    probability: Math.max(10, Math.min(99, probability)),
    openingRank,
    closingRank,
  };
};

const isEligibleForExam = (exam: string, college: CollegeData) => {
  const normalizedType = college.type.toLowerCase();
  const normalizedExam = normalizeExam(exam);

  if (normalizedExam === 'jee' || normalizedExam === 'jee-main') {
    return !isIitCollege(college) && (normalizedType.includes('engineering') || normalizedType.includes('architecture') || normalizedType.includes('university'));
  }

  if (normalizedExam.includes('advanced')) {
    return normalizedType.includes('engineering') || normalizedType.includes('architecture') || normalizedType.includes('university') || isIitCollege(college);
  }

  if (/neet|medical/i.test(exam)) {
    return normalizedType.includes('medical') || normalizedType.includes('dental') || normalizedType.includes('pharmacy') || normalizedType.includes('university');
  }

  return true;
};

const scoreCollege = (college: CollegeData, rank: number, exam: string): PredictionCollege | null => {
  if (isIitCollege(college)) {
    return scoreIitCollege(college, rank, exam);
  }

  const openingRank = Math.max(1, Math.min(college.minRank, college.maxRank));
  const closingRank = Math.max(openingRank, college.maxRank);

  const safeThreshold = closingRank - 500;
  const moderateUpper = closingRank + 500;

  if (rank > moderateUpper + 500) {
    return null;
  }

  let match: PredictionCollege['match'] = 'Tough';
  let probability = 35;

  if (rank <= safeThreshold) {
    match = 'Safe';
    probability = 85;
  } else if (rank <= closingRank) {
    match = 'Moderate';
    probability = 65;
  } else if (rank <= moderateUpper) {
    match = 'Tough';
    probability = 45;
  } else {
    probability = Math.max(15, 45 - Math.round(((rank - moderateUpper) / 500) * 30));
  }

  return {
    ...college,
    match,
    probability: Math.max(10, Math.min(95, probability)),
    openingRank,
    closingRank,
  };
};

export const predict = async (req: AuthRequest, res: Response) => {
  try {
    const { exam, rank } = req.body;

    if (!exam || !rank) {
      return res.status(400).json({ message: 'Exam and rank are required' });
    }

    const parsedRank = Number.parseInt(String(rank), 10);
    if (Number.isNaN(parsedRank) || parsedRank < 1) {
      return res.status(400).json({ message: 'Rank must be a positive number' });
    }

    const allColleges = loadAllColleges();
    
    const predictedColleges = allColleges
      .filter((college) => isEligibleForExam(exam, college))
      .map((college) => scoreCollege(college, parsedRank, exam))
      .filter((college): college is PredictionCollege => Boolean(college))
      .sort((left, right) => {
        if (left.match !== right.match) {
          const order: Record<PredictionCollege['match'], number> = { Safe: 0, Moderate: 1, Tough: 2 };
          return order[left.match] - order[right.match];
        }

        return left.closingRank - right.closingRank;
      })
      .slice(0, 25);

    let specialMessage: string | undefined;
    const normalizedExam = normalizeExam(exam);
    if (normalizedExam === 'jee') {
      specialMessage = 'IIT admission requires a JEE Advanced rank.';
    }

    res.json({
      mode: 'indian',
      exam,
      rank: parsedRank,
      message: specialMessage,
      colleges: predictedColleges,
    });
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ message: 'Failed to predict colleges' });
  }
};

export const getAvailableExams = async (req: AuthRequest, res: Response) => {
  try {
    const exams = ['JEE', 'JEE Advanced', 'NEET', 'CAT', 'GATE'];
    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};