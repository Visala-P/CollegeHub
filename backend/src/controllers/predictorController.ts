import { Response } from 'express';
import { AuthRequest } from '../types/index.js';

const MLNET_BASE_URL = (process.env.MLNET_PREDICTION_URL || process.env.MLNET_SERVICE_URL || 'http://127.0.0.1:5107').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.MLNET_TIMEOUT_MS ?? '15000', 10);
const MAX_RETRIES = Number.parseInt(process.env.MLNET_RETRY_COUNT ?? '1', 10);

const normalizeExam = (exam: string | undefined) => {
  const value = (exam ?? '').trim().toLowerCase();
  if (['jee-main', 'jee', 'jee main'].includes(value)) return 'jee-main';
  if (['jee-advanced', 'advanced', 'jee advanced'].includes(value)) return 'jee-advanced';
  if (['neet', 'neet-ug', 'medical'].includes(value)) return 'neet';
  return null;
};

const normalizeCategory = (category: string | undefined) => {
  const value = (category ?? 'GENERAL').trim().toUpperCase();
  return ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'].includes(value) ? value : 'GENERAL';
};

const normalizeQuota = (quota: string | undefined) => ((quota ?? 'AI').trim().toUpperCase() === 'HS' ? 'HS' : 'AI');

const normalizeGender = (gender: string | undefined) => {
  const value = (gender ?? 'male').trim().toLowerCase();
  if (value.includes('female')) return 'female';
  if (value.includes('other') || value.includes('non-binary') || value.includes('trans')) return 'other';
  return 'male';
};

const parsePredictorInput = (payload: any) => {
  const examType = normalizeExam(payload?.examType ?? payload?.exam);
  const rank = Number.parseInt(String(payload?.rank), 10);

  if (!examType || !Number.isFinite(rank) || rank < 1) {
    return null;
  }

  const maxResults = Number.parseInt(String(payload?.maxResults ?? 30), 10);

  return {
    examType,
    rank,
    percentile: payload?.percentile != null ? Number(payload.percentile) : undefined,
    category: normalizeCategory(payload?.category),
    gender: normalizeGender(payload?.gender),
    homeState: typeof payload?.homeState === 'string' && payload.homeState.trim() ? payload.homeState.trim() : undefined,
    quota: normalizeQuota(payload?.quota),
    preferredBranch: typeof payload?.preferredBranch === 'string' && payload.preferredBranch.trim() ? payload.preferredBranch.trim() : undefined,
    maxResults: Number.isFinite(maxResults) ? Math.min(60, Math.max(1, maxResults)) : 30,
  };
};

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`ML.NET request timed out after ${timeoutMs}ms`)), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const postPredictRequest = async (payload: unknown) => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[predictor] POST ${MLNET_BASE_URL}/predict attempt=${attempt + 1}`);
      const response = await fetchWithTimeout(
        `${MLNET_BASE_URL}/predict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        REQUEST_TIMEOUT_MS,
      );

      return response;
    } catch (error) {
      lastError = error;
      console.error(`[predictor] ML.NET request failed attempt=${attempt + 1}`, error);

      if (attempt < MAX_RETRIES) {
        await delay(250 * (attempt + 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown ML.NET request failure');
};

export const predict = async (req: AuthRequest, res: Response) => {
  try {
    console.log('[predictor] request body:', JSON.stringify(req.body));

    const predictorInput = parsePredictorInput(req.body);

    if (!predictorInput) {
      return res.status(400).json({ message: 'Invalid predictor input. Exam and rank are required.' });
    }

    const response = await postPredictRequest(predictorInput);
    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error('[predictor] ML.NET returned error', {
        status: response.status,
        body: responseBodyText,
      });

      const statusCode = response.status === 503 || response.status === 504 ? response.status : 502;
      return res.status(statusCode).json({
        message: 'ML.NET prediction service failed',
        upstreamStatus: response.status,
        upstreamBody: responseBodyText,
      });
    }

    let predictedColleges: any;
    try {
      predictedColleges = responseBodyText ? JSON.parse(responseBodyText) : {};
    } catch (parseError) {
      console.error('[predictor] Failed to parse ML.NET response JSON', parseError, responseBodyText);
      return res.status(502).json({
        message: 'ML.NET prediction service returned invalid JSON',
      });
    }

    const examLabel = predictorInput.examType === 'jee-main'
      ? 'JEE Main'
      : predictorInput.examType === 'jee-advanced'
      ? 'JEE Advanced'
      : 'NEET';

    const colleges = Array.isArray(predictedColleges.colleges) ? predictedColleges.colleges : [];
    console.log(`[predictor] success exam=${predictorInput.examType} rank=${predictorInput.rank} colleges=${colleges.length}`);

    res.json({
      mode: 'indian',
      exam: predictorInput.examType,
      examLabel,
      rank: predictorInput.rank,
      category: predictorInput.category,
      quota: predictorInput.quota,
      gender: predictorInput.gender,
      homeState: predictorInput.homeState ?? null,
      preferredBranch: predictorInput.preferredBranch,
      percentile: predictedColleges.inputPercentile ?? predictorInput.percentile ?? null,
      model: {
        version: predictedColleges.modelVersion ?? 'mlnet-admission-v1',
        notes: 'MongoDB-backed college data with ML.NET trained inference.',
      },
      colleges,
      message: predictedColleges.message ?? 'Predictions generated successfully',
    });
  } catch (error) {
    console.error('[predictor] predict error:', error);
    res.status(503).json({
      message: 'Failed to predict colleges',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAvailableExams = async (req: AuthRequest, res: Response) => {
  try {
    res.json([
      { id: 'jee-main', name: 'JEE Main' },
      { id: 'jee-advanced', name: 'JEE Advanced' },
      { id: 'neet', name: 'NEET' },
    ]);
  } catch (error) {
    console.error('[predictor] getAvailableExams error:', error);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};