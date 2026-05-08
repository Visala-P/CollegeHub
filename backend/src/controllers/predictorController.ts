import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { loadAllColleges } from '../services/localCollegeData.js';
import { buildPredictorInput, predictColleges, predictorMetadata } from '../services/predictorEngine.js';

export const predict = async (req: AuthRequest, res: Response) => {
  try {
    const predictorInput = buildPredictorInput({
      exam: req.body?.exam,
      rank: req.body?.rank,
      category: req.body?.category,
      quota: req.body?.quota,
      gender: req.body?.gender,
      homeState: req.body?.homeState,
      preferredBranch: req.body?.preferredBranch,
      maxResults: req.body?.maxResults,
    });

    if (!predictorInput) {
      return res.status(400).json({ message: 'Invalid predictor input. Exam and rank are required.' });
    }

    const allColleges = loadAllColleges();
    const predictedColleges = predictColleges(allColleges, predictorInput);

    const examLabel = predictorInput.exam === 'jee-main'
      ? 'JEE Main'
      : predictorInput.exam === 'jee-advanced'
      ? 'JEE Advanced'
      : 'NEET';

    res.json({
      mode: 'indian',
      exam: predictorInput.exam,
      examLabel,
      rank: predictorInput.rank,
      category: predictorInput.category,
      quota: predictorInput.quota,
      gender: predictorInput.gender,
      homeState: predictorInput.homeState ?? null,
      preferredBranch: predictorInput.preferredBranch,
      percentile: predictorMetadata.percentileFromRank(predictorInput.exam, predictorInput.rank),
      model: {
        version: 'v2-counseling-engine',
        notes: 'Rank normalization + historical cutoffs + tier + branch competitiveness + quota/category adjustments.',
      },
      colleges: predictedColleges,
    });
  } catch (error) {
    console.error('Predict error:', error);
    res.status(500).json({ message: 'Failed to predict colleges' });
  }
};

export const getAvailableExams = async (req: AuthRequest, res: Response) => {
  try {
    const exams = [
      { id: 'jee-main', name: 'JEE Main' },
      { id: 'jee-advanced', name: 'JEE Advanced' },
      { id: 'neet', name: 'NEET' },
    ];
    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};