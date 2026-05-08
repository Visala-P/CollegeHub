import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collegeCutoffs, type CutoffRecord } from '../data/collegeCutoffs.js';
import { type CollegeData } from './localCollegeData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

type ExamType = 'jee-main' | 'jee-advanced' | 'neet';
type CategoryType = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';
type QuotaType = 'AI' | 'HS';
type GenderType = 'gender-neutral' | 'female';
type MatchBand = 'Dream' | 'Reach' | 'Moderate' | 'Safe';
type InstitutionType =
  | 'IIT'
  | 'NIT'
  | 'IIIT'
  | 'GFTI'
  | 'AIIMS'
  | 'GOVT_MEDICAL'
  | 'PRIVATE_MEDICAL'
  | 'TOP_PRIVATE_UNIVERSITY'
  | 'STATE_UNIVERSITY'
  | 'ENGINEERING_COLLEGE'
  | 'MEDICAL_COLLEGE'
  | 'OTHER';

type CutoffSource = 'historical-cutoff' | 'modeled-cutoff' | 'dataset-fallback';

interface PredictorInput {
  exam: ExamType;
  rank: number;
  category: CategoryType;
  quota: QuotaType;
  gender: GenderType;
  homeState?: string;
  preferredBranch?: string;
  maxResults: number;
}

interface RankedCollege extends CollegeData {
  match: MatchBand;
  probability: number;
  openingRank: number;
  closingRank: number;
  predictedPercentile: number;
  tier: string;
  institutionType: InstitutionType;
  confidence: number;
  cutoffSource: CutoffSource;
  recommendedBranch: string;
  score: number;
}

interface CutoffEstimate {
  openingRank: number;
  closingRank: number;
  source: CutoffSource;
  confidence: number;
  institutionType: InstitutionType;
  tier: string;
  recommendedBranch: string;
  trendScore: number;
}

const EXAM_TOTAL_CANDIDATES: Record<ExamType, number> = {
  'jee-main': 1200000,
  'jee-advanced': 180000,
  neet: 2400000,
};

const CATEGORY_FACTOR: Record<CategoryType, number> = {
  GENERAL: 1,
  EWS: 1.16,
  OBC: 1.42,
  SC: 2.6,
  ST: 3.4,
};

const BRANCH_FACTOR_ENGINEERING: Record<string, number> = {
  cse: 0.52,
  cs: 0.55,
  ai: 0.58,
  aiml: 0.6,
  data: 0.62,
  ece: 0.76,
  ee: 0.88,
  electrical: 0.88,
  it: 0.72,
  mechanical: 1.08,
  civil: 1.34,
  chemical: 1.14,
  biotech: 1.2,
  default: 0.94,
};

const BRANCH_FACTOR_MEDICAL: Record<string, number> = {
  mbbs: 0.5,
  bds: 0.88,
  pharmacy: 1.24,
  nursing: 1.34,
  default: 0.86,
};

const PRIORITY_SCORE: Record<InstitutionType, number> = {
  IIT: 100,
  AIIMS: 98,
  NIT: 92,
  IIIT: 88,
  GFTI: 82,
  GOVT_MEDICAL: 90,
  TOP_PRIVATE_UNIVERSITY: 78,
  STATE_UNIVERSITY: 72,
  ENGINEERING_COLLEGE: 68,
  MEDICAL_COLLEGE: 70,
  PRIVATE_MEDICAL: 66,
  OTHER: 50,
};

const BASE_CLOSING_BY_TYPE: Record<ExamType, Partial<Record<InstitutionType, number[]>>> = {
  'jee-advanced': {
    IIT: [220, 1500, 5200, 12500],
    NIT: [14000, 26000, 52000, 90000],
    IIIT: [12000, 24000, 48000, 82000],
    GFTI: [24000, 52000, 98000, 140000],
    TOP_PRIVATE_UNIVERSITY: [50000, 90000, 150000, 220000],
    STATE_UNIVERSITY: [70000, 120000, 180000, 260000],
    ENGINEERING_COLLEGE: [85000, 140000, 220000, 300000],
  },
  'jee-main': {
    NIT: [9000, 23000, 52000, 95000],
    IIIT: [13000, 30000, 62000, 110000],
    GFTI: [28000, 62000, 120000, 180000],
    TOP_PRIVATE_UNIVERSITY: [45000, 90000, 170000, 260000],
    STATE_UNIVERSITY: [70000, 150000, 240000, 360000],
    ENGINEERING_COLLEGE: [90000, 180000, 300000, 450000],
    OTHER: [110000, 210000, 340000, 520000],
  },
  neet: {
    AIIMS: [180, 1300, 4500, 12000],
    GOVT_MEDICAL: [2500, 10000, 26000, 52000],
    MEDICAL_COLLEGE: [8000, 25000, 65000, 120000],
    PRIVATE_MEDICAL: [45000, 125000, 260000, 540000],
    TOP_PRIVATE_UNIVERSITY: [65000, 160000, 320000, 620000],
  },
};

const RANK_FILES_BY_EXAM: Record<ExamType, string[]> = {
  'jee-main': ['engineering_ranking.json', 'overall_ranking.json', 'university_ranking.json'],
  'jee-advanced': ['engineering_ranking.json', 'overall_ranking.json'],
  neet: ['medical_ranking.json', 'overall_ranking.json', 'university_ranking.json'],
};

const rankingCache: Partial<Record<ExamType, Map<string, number>>> = {};
const lookupCache = new Map<string, number | null>();

const normalizeName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[.,()&]/g, ' ')
    .replace(/\bof\b|\band\b|\bthe\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesAny = (value: string, tokens: string[]): boolean => tokens.some((token) => value.includes(token));

const inferInstitutionType = (college: CollegeData): InstitutionType => {
  const name = college.name.toLowerCase();
  const type = college.type.toLowerCase();

  if (name.includes('iit ') || name.startsWith('iit') || name.includes('indian institute of technology')) return 'IIT';
  if (name.includes('nit ') || name.startsWith('nit') || name.includes('national institute of technology')) return 'NIT';
  if (name.includes('iiit ') || name.startsWith('iiit') || name.includes('indian institute of information technology')) return 'IIIT';
  if (name.includes('gfti')) return 'GFTI';
  if (name.includes('aiims') || name.includes('all india institute of medical sciences')) return 'AIIMS';

  const medicalTokens = ['medical', 'mbbs', 'dental', 'hospital', 'health'];
  const privateTokens = ['private', 'deemed', 'deemed to be university'];
  const universityTokens = ['university'];
  const stateTokens = ['state ', 'government', 'govt'];

  if (includesAny(name, medicalTokens) || includesAny(type, ['medical', 'dental', 'pharmacy'])) {
    if (includesAny(name, stateTokens) || includesAny(type, ['medical'])) return 'GOVT_MEDICAL';
    if (includesAny(name, privateTokens)) return 'PRIVATE_MEDICAL';
    return 'MEDICAL_COLLEGE';
  }

  if (includesAny(name, universityTokens) || type.includes('university')) {
    if (includesAny(name, ['bits', 'vit', 'srm', 'manipal', 'amity', 'thapar'])) return 'TOP_PRIVATE_UNIVERSITY';
    if (includesAny(name, stateTokens)) return 'STATE_UNIVERSITY';
    return 'TOP_PRIVATE_UNIVERSITY';
  }

  if (includesAny(type, ['engineering', 'architecture']) || includesAny(name, ['engineering', 'technology', 'institute of technology'])) {
    return 'ENGINEERING_COLLEGE';
  }

  return 'OTHER';
};

const isExamEligible = (exam: ExamType, institutionType: InstitutionType): boolean => {
  if (exam === 'neet') {
    return ['AIIMS', 'GOVT_MEDICAL', 'PRIVATE_MEDICAL', 'MEDICAL_COLLEGE', 'TOP_PRIVATE_UNIVERSITY'].includes(institutionType);
  }

  if (exam === 'jee-advanced') {
    return ['IIT', 'NIT', 'IIIT', 'GFTI', 'STATE_UNIVERSITY', 'TOP_PRIVATE_UNIVERSITY', 'ENGINEERING_COLLEGE', 'OTHER'].includes(institutionType);
  }

  return ['NIT', 'IIIT', 'GFTI', 'STATE_UNIVERSITY', 'TOP_PRIVATE_UNIVERSITY', 'ENGINEERING_COLLEGE', 'OTHER'].includes(institutionType);
};

const getRankingMapForExam = (exam: ExamType): Map<string, number> => {
  if (rankingCache[exam]) {
    return rankingCache[exam] as Map<string, number>;
  }

  const rankingMap = new Map<string, number>();

  for (const fileName of RANK_FILES_BY_EXAM[exam]) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<{ name?: string; rank?: number }>;
      for (const item of parsed) {
        if (!item.name || typeof item.rank !== 'number') {
          continue;
        }

        const key = normalizeName(item.name);
        const existing = rankingMap.get(key);
        if (existing == null || item.rank < existing) {
          rankingMap.set(key, item.rank);
        }
      }
    } catch (error) {
      console.error(`Failed to parse ranking file ${fileName}:`, error);
    }
  }

  rankingCache[exam] = rankingMap;
  return rankingMap;
};

const lookupRankingForCollege = (exam: ExamType, collegeName: string): number | null => {
  const cacheKey = `${exam}:${collegeName}`;
  if (lookupCache.has(cacheKey)) {
    return lookupCache.get(cacheKey) ?? null;
  }

  const map = getRankingMapForExam(exam);
  const normalizedCollegeName = normalizeName(collegeName);

  const exact = map.get(normalizedCollegeName);
  if (exact != null) {
    lookupCache.set(cacheKey, exact);
    return exact;
  }

  let bestMatch: number | null = null;
  for (const [nameKey, rank] of map.entries()) {
    if (nameKey.includes(normalizedCollegeName) || normalizedCollegeName.includes(nameKey)) {
      if (bestMatch == null || rank < bestMatch) {
        bestMatch = rank;
      }
    }
  }

  lookupCache.set(cacheKey, bestMatch);
  return bestMatch;
};

const inferTier = (institutionType: InstitutionType, nirfRank: number | null): string => {
  if (institutionType === 'IIT' || institutionType === 'AIIMS') {
    if (nirfRank != null && nirfRank <= 5) return 'Tier 1A';
    if (nirfRank != null && nirfRank <= 15) return 'Tier 1B';
    return 'Tier 1';
  }

  if (nirfRank != null) {
    if (nirfRank <= 25) return 'Tier 1';
    if (nirfRank <= 60) return 'Tier 2';
    if (nirfRank <= 120) return 'Tier 3';
  }

  if (['NIT', 'IIIT', 'GOVT_MEDICAL'].includes(institutionType)) return 'Tier 2';
  if (['GFTI', 'STATE_UNIVERSITY', 'TOP_PRIVATE_UNIVERSITY', 'MEDICAL_COLLEGE'].includes(institutionType)) return 'Tier 3';
  return 'Tier 4';
};

const tierToIndex = (tier: string): number => {
  if (tier === 'Tier 1A' || tier === 'Tier 1B' || tier === 'Tier 1') return 0;
  if (tier === 'Tier 2') return 1;
  if (tier === 'Tier 3') return 2;
  return 3;
};

const normalizeCategory = (category: string | undefined): CategoryType => {
  const normalized = (category ?? 'GENERAL').trim().toUpperCase();
  if (normalized === 'OBC' || normalized === 'SC' || normalized === 'ST' || normalized === 'EWS') {
    return normalized;
  }
  return 'GENERAL';
};

const normalizeQuota = (quota: string | undefined): QuotaType => {
  return (quota ?? 'AI').trim().toUpperCase() === 'HS' ? 'HS' : 'AI';
};

const normalizeGender = (gender: string | undefined): GenderType => {
  const normalized = (gender ?? 'gender-neutral').trim().toLowerCase();
  return normalized.includes('female') ? 'female' : 'gender-neutral';
};

const normalizeBranch = (branch: string | undefined, exam: ExamType): string => {
  if (branch && branch.trim().length > 0) {
    return branch.trim();
  }

  if (exam === 'neet') {
    return 'MBBS';
  }

  return 'Computer Science';
};

const branchFactorFor = (branch: string, exam: ExamType): number => {
  const normalized = branch.toLowerCase();

  if (exam === 'neet') {
    for (const [key, value] of Object.entries(BRANCH_FACTOR_MEDICAL)) {
      if (key !== 'default' && normalized.includes(key)) {
        return value;
      }
    }
    return BRANCH_FACTOR_MEDICAL.default;
  }

  for (const [key, value] of Object.entries(BRANCH_FACTOR_ENGINEERING)) {
    if (key !== 'default' && normalized.includes(key)) {
      return value;
    }
  }
  return BRANCH_FACTOR_ENGINEERING.default;
};

const normalizeExam = (exam: string | undefined): ExamType | null => {
  const normalized = (exam ?? '').trim().toLowerCase();

  if (['jee-main', 'jee', 'jee main'].includes(normalized)) return 'jee-main';
  if (['jee-advanced', 'advanced', 'jee advanced'].includes(normalized)) return 'jee-advanced';
  if (['neet', 'neet-ug', 'medical'].includes(normalized)) return 'neet';

  return null;
};

const categoryToCutoffCategory = (category: CategoryType): CutoffRecord['category'] => {
  if (category === 'OBC' || category === 'SC' || category === 'ST') {
    return category;
  }
  return 'OPEN';
};

const getHistoricalCutoff = (
  college: CollegeData,
  exam: ExamType,
  category: CategoryType,
  preferredBranch: string,
): { openingRank: number; closingRank: number; confidence: number; trendScore: number; recommendedBranch: string } | null => {
  const examKey = exam;
  const categoryKey = categoryToCutoffCategory(category);
  const normalizedCollegeName = normalizeName(college.name);

  const records = collegeCutoffs.filter((cutoff) => {
    if (cutoff.exam !== examKey) {
      return false;
    }

    const normalizedCutoffCollege = normalizeName(cutoff.collegeName);
    if (!(normalizedCutoffCollege.includes(normalizedCollegeName) || normalizedCollegeName.includes(normalizedCutoffCollege))) {
      return false;
    }

    return cutoff.category === categoryKey || cutoff.category === 'OPEN';
  });

  if (records.length === 0) {
    return null;
  }

  const branchNormalized = preferredBranch.toLowerCase();
  const exactBranchMatches = records.filter((record) => (record.branch ?? '').toLowerCase().includes(branchNormalized));
  const candidates = exactBranchMatches.length > 0 ? exactBranchMatches : records;

  const latestYear = Math.max(...candidates.map((candidate) => candidate.year));
  const latestRecords = candidates.filter((candidate) => candidate.year === latestYear);

  const openingRank = Math.round(latestRecords.reduce((sum, row) => sum + row.openingRank, 0) / latestRecords.length);
  const closingRank = Math.round(latestRecords.reduce((sum, row) => sum + row.closingRank, 0) / latestRecords.length);

  const historicalAverage = Math.round(candidates.reduce((sum, row) => sum + row.closingRank, 0) / candidates.length);
  const trendScore = historicalAverage > 0 ? Math.max(0.82, Math.min(1.18, historicalAverage / Math.max(1, closingRank))) : 1;

  return {
    openingRank,
    closingRank,
    confidence: exactBranchMatches.length > 0 ? 0.93 : 0.88,
    trendScore,
    recommendedBranch: latestRecords[0]?.branch ?? preferredBranch,
  };
};

const modeledCutoff = (
  college: CollegeData,
  input: PredictorInput,
  institutionType: InstitutionType,
  tier: string,
  nirfRank: number | null,
): CutoffEstimate => {
  const branchFactor = branchFactorFor(input.preferredBranch ?? '', input.exam);
  const tierIndex = tierToIndex(tier);
  const baseArray = BASE_CLOSING_BY_TYPE[input.exam][institutionType] ?? BASE_CLOSING_BY_TYPE[input.exam].OTHER ?? [120000, 240000, 380000, 520000];
  const baseClosing = baseArray[Math.min(tierIndex, baseArray.length - 1)];

  const categoryFactor = CATEGORY_FACTOR[input.category];
  const homeStateBoost = input.quota === 'HS' && input.homeState && college.state.toLowerCase() === input.homeState.toLowerCase() ? 1.22 : 1;
  const femaleBoost = input.gender === 'female' ? 1.1 : 1;
  const rankQualityBoost = nirfRank != null ? Math.max(0.62, Math.min(1.2, 1.15 - nirfRank / 240)) : 1;

  const closingRank = Math.max(
    30,
    Math.round(baseClosing * branchFactor * categoryFactor * homeStateBoost * femaleBoost * rankQualityBoost),
  );

  const openingSpread = institutionType === 'IIT' || institutionType === 'AIIMS' ? 0.2 : 0.35;
  const openingRank = Math.max(1, Math.round(closingRank * openingSpread));

  return {
    openingRank,
    closingRank,
    source: nirfRank != null ? 'modeled-cutoff' : 'dataset-fallback',
    confidence: nirfRank != null ? 0.72 : 0.58,
    institutionType,
    tier,
    recommendedBranch: input.preferredBranch ?? (input.exam === 'neet' ? 'MBBS' : 'Computer Science'),
    trendScore: 1,
  };
};

const classifyMatch = (probability: number): MatchBand => {
  if (probability >= 80) return 'Safe';
  if (probability >= 60) return 'Moderate';
  if (probability >= 35) return 'Reach';
  return 'Dream';
};

const percentileFromRank = (exam: ExamType, rank: number): number => {
  const total = EXAM_TOTAL_CANDIDATES[exam];
  const percentile = (1 - Math.min(rank, total) / total) * 100;
  return Math.max(0.01, Math.min(99.99, Number(percentile.toFixed(2))));
};

const probabilityFromCutoff = (rank: number, openingRank: number, closingRank: number, confidence: number): number => {
  const spread = Math.max(100, closingRank - openingRank);
  const z = (closingRank - rank) / spread;
  const logistic = 1 / (1 + Math.exp(-z * 2.6));

  const rawProbability = logistic * 100;
  const confidenceAdjustment = 50 + (rawProbability - 50) * confidence;

  return Math.max(5, Math.min(98, Math.round(confidenceAdjustment)));
};

const predictionScore = (college: RankedCollege): number => {
  const matchBoost: Record<MatchBand, number> = {
    Dream: 3,
    Reach: 8,
    Moderate: 12,
    Safe: 9,
  };

  const tierBoost = college.tier.startsWith('Tier 1') ? 15 : college.tier === 'Tier 2' ? 10 : college.tier === 'Tier 3' ? 6 : 3;

  return (
    college.probability * 0.55 +
    PRIORITY_SCORE[college.institutionType] * 0.25 +
    tierBoost +
    matchBoost[college.match] +
    college.confidence * 12
  );
};

export const buildPredictorInput = (payload: {
  exam?: string;
  rank?: number;
  category?: string;
  quota?: string;
  gender?: string;
  homeState?: string;
  preferredBranch?: string;
  maxResults?: number;
}): PredictorInput | null => {
  const exam = normalizeExam(payload.exam);
  if (!exam) {
    return null;
  }

  const rank = Number.parseInt(String(payload.rank), 10);
  if (!Number.isFinite(rank) || rank < 1) {
    return null;
  }

  return {
    exam,
    rank,
    category: normalizeCategory(payload.category),
    quota: normalizeQuota(payload.quota),
    gender: normalizeGender(payload.gender),
    homeState: payload.homeState?.trim() || undefined,
    preferredBranch: normalizeBranch(payload.preferredBranch, exam),
    maxResults: Math.min(60, Math.max(10, Number(payload.maxResults ?? 30))),
  };
};

export const predictColleges = (colleges: CollegeData[], input: PredictorInput): RankedCollege[] => {
  const recommendations: RankedCollege[] = [];

  for (const college of colleges) {
    const institutionType = inferInstitutionType(college);
    if (!isExamEligible(input.exam, institutionType)) {
      continue;
    }

    const nirfRank = lookupRankingForCollege(input.exam, college.name);
    const tier = inferTier(institutionType, nirfRank);

    const historical = getHistoricalCutoff(college, input.exam, input.category, input.preferredBranch ?? '');

    const estimate = historical
      ? {
          openingRank: historical.openingRank,
          closingRank: historical.closingRank,
          source: 'historical-cutoff' as const,
          confidence: historical.confidence,
          institutionType,
          tier,
          recommendedBranch: historical.recommendedBranch,
          trendScore: historical.trendScore,
        }
      : modeledCutoff(college, input, institutionType, tier, nirfRank);

    const adjustedClosing = Math.max(estimate.openingRank + 50, Math.round(estimate.closingRank * estimate.trendScore));
    const probability = probabilityFromCutoff(input.rank, estimate.openingRank, adjustedClosing, estimate.confidence);

    if (probability < 8) {
      continue;
    }

    const prediction: RankedCollege = {
      ...college,
      match: classifyMatch(probability),
      probability,
      openingRank: estimate.openingRank,
      closingRank: adjustedClosing,
      predictedPercentile: percentileFromRank(input.exam, input.rank),
      tier: estimate.tier,
      institutionType: estimate.institutionType,
      confidence: Number(estimate.confidence.toFixed(2)),
      cutoffSource: estimate.source,
      recommendedBranch: estimate.recommendedBranch,
      score: 0,
    };

    prediction.score = predictionScore(prediction);
    recommendations.push(prediction);
  }

  recommendations.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    if (right.probability !== left.probability) {
      return right.probability - left.probability;
    }
    return left.closingRank - right.closingRank;
  });

  const uniqueByName = new Set<string>();
  const deduped: RankedCollege[] = [];

  for (const college of recommendations) {
    const key = normalizeName(college.name);
    if (uniqueByName.has(key)) {
      continue;
    }
    uniqueByName.add(key);
    deduped.push(college);

    if (deduped.length >= input.maxResults) {
      break;
    }
  }

  return deduped;
};

export const predictorMetadata = {
  normalizeExam,
  percentileFromRank,
};

export type { PredictorInput, RankedCollege, ExamType, CategoryType, QuotaType, GenderType, MatchBand, InstitutionType };