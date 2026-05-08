const IS_GITHUB_PAGES = import.meta.env.VITE_GITHUB_PAGES === 'true';

const API_BASE_URL = (() => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }

  if (IS_GITHUB_PAGES) {
    return '';
  }

  return `${window.location.origin}/api`;
})();

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  course: string;
}

export interface Placement {
  year: number;
  company: string;
  package: number;
  studentsPlaced: number;
}

export interface College {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  fees: number;
  rating: number;
  courses: string[];
  type: string;
  established: number;
  image: string;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
  totalStudents: number;
  facultyCount: number;
  campusSize: string;
  minRank: number;
  maxRank: number;
  description: string;
  reviews: Review[];
  placements: Placement[];
}

export interface PredictionCollege extends College {
  match: 'Safe' | 'Moderate' | 'Tough';
  probability: number;
  openingRank: number;
  closingRank: number;
}

export interface Answer {
  id: string;
  author: string;
  content: string;
  date: string;
  upvotes: number;
}

export interface Question {
  id: string;
  author: string;
  title: string;
  content: string;
  date: string;
  answers: Answer[];
  tags: string[];
  answersCount?: number;
}

export interface SavedComparison {
  id?: number;
  colleges: College[];
  createdAt: string;
}

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeReview = (review: any): Review => ({
  id: String(review.id),
  author: review.author ?? '',
  rating: toNumber(review.rating),
  date: review.date ?? '',
  comment: review.comment ?? '',
  course: review.course ?? '',
});

const normalizePlacement = (placement: any): Placement => ({
  year: toNumber(placement.year),
  company: placement.company ?? '',
  package: toNumber(placement.package),
  studentsPlaced: toNumber(placement.students_placed ?? placement.studentsPlaced),
});

const normalizeCollege = (college: any): College => ({
  id: String(college.id),
  name: college.name ?? '',
  location: college.location ?? '',
  city: college.city ?? '',
  state: college.state ?? '',
  fees: toNumber(college.fees),
  rating: toNumber(college.rating),
  courses: Array.isArray(college.courses) ? college.courses : [],
  type: college.type ?? '',
  established: toNumber(college.established),
  image: college.image ?? '',
  placementRate: toNumber(college.placement_rate ?? college.placementRate),
  averagePackage: toNumber(college.average_package ?? college.averagePackage),
  highestPackage: toNumber(college.highest_package ?? college.highestPackage),
  totalStudents: toNumber(college.total_students ?? college.totalStudents),
  facultyCount: toNumber(college.faculty_count ?? college.facultyCount),
  campusSize: college.campus_size ?? college.campusSize ?? '',
  minRank: toNumber(college.min_rank ?? college.minRank),
  maxRank: toNumber(college.max_rank ?? college.maxRank),
  description: college.description ?? '',
  reviews: Array.isArray(college.reviews) ? college.reviews.map(normalizeReview) : [],
  placements: Array.isArray(college.placements) ? college.placements.map(normalizePlacement) : [],
});

const normalizeAnswer = (answer: any): Answer => ({
  id: String(answer.id),
  author: answer.author ?? '',
  content: answer.content ?? '',
  date: answer.date ?? '',
  upvotes: toNumber(answer.upvotes),
});

const normalizeQuestion = (question: any): Question => ({
  id: String(question.id),
  author: question.author ?? '',
  title: question.title ?? '',
  content: question.content ?? '',
  date: question.date ?? '',
  tags: Array.isArray(question.tags) ? question.tags : [],
  answers: Array.isArray(question.answers) ? question.answers.map(normalizeAnswer) : [],
  answersCount: question.answersCount != null ? toNumber(question.answersCount) : undefined,
});

const normalizeSavedComparison = (comparison: any): SavedComparison => ({
  id: comparison.id != null ? toNumber(comparison.id) : undefined,
  colleges: Array.isArray(comparison.colleges) ? comparison.colleges.map(normalizeCollege) : [],
  createdAt: comparison.createdAt ?? comparison.created_at ?? '',
});

const parseJsonSafely = (rawBody: string, responseUrl: string) => {
  const trimmedBody = rawBody.trimStart();

  if (trimmedBody.startsWith('<!DOCTYPE') || trimmedBody.startsWith('<html') || trimmedBody.startsWith('<')) {
    throw new Error(
      `Expected JSON from ${responseUrl || 'the API'}, but received HTML instead. ` +
        'Check that VITE_API_BASE_URL points to the backend, not the frontend app.'
    );
  }

  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch {
    throw new Error(
      `Invalid JSON from ${responseUrl || 'the API'}. Check that VITE_API_BASE_URL points to the backend.`
    );
  }
};

const readJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';
  const rawBody = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON from ${response.url || 'the API'}, but received ${contentType || 'an unknown content type'}. ` +
        'Set VITE_API_BASE_URL to your deployed backend URL when using GitHub Pages.'
    );
  }

  return parseJsonSafely(rawBody, response.url || 'the API');
};

const makeRequest = async (endpoint: string, options: RequestOptions = {}) => {
  const { method = 'GET', headers = {}, body } = options;

  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured. Set it to your deployed backend URL for GitHub Pages.');
  }

  const token = localStorage.getItem('token');
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await readJsonResponse(response);
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await readJsonResponse(response);
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

// College APIs
export const collegeAPI = {
  getAll: (page = 1, limit = 6, filters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...filters,
    });
    return makeRequest(`/colleges?${params}`).then((response) => ({
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeCollege) : [],
    }));
  },

  getById: (id: string) => makeRequest(`/colleges/${id}`).then(normalizeCollege),

  search: (query: string) => makeRequest(`/colleges/search?query=${encodeURIComponent(query)}`).then((response) =>
    Array.isArray(response) ? response.map(normalizeCollege) : []
  ),

  getFilters: () => makeRequest('/colleges/filters'),
};

// Auth APIs
export const authAPI = {
  register: (email: string, password: string, firstName?: string, lastName?: string) =>
    makeRequest('/auth/register', {
      method: 'POST',
      body: { email, password, firstName, lastName },
    }),

  login: (email: string, password: string) =>
    makeRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getProfile: () => makeRequest('/auth/profile'),

  saveCollege: (collegeId: number) =>
    makeRequest('/auth/save-college', {
      method: 'POST',
      body: { collegeId },
    }),

  unsaveCollege: (collegeId: number) =>
    makeRequest('/auth/unsave-college', {
      method: 'POST',
      body: { collegeId },
    }),

  getSavedColleges: () => makeRequest('/auth/saved-colleges').then((response) =>
    Array.isArray(response) ? response.map(normalizeCollege) : []
  ),
};

// Compare APIs
export const compareAPI = {
  compareColleges: (ids: number[]) => {
    const idString = ids.join(',');
    return makeRequest(`/compare?ids=${idString}`).then((response) =>
      Array.isArray(response) ? response.map(normalizeCollege) : []
    );
  },

  saveComparison: (collegeIds: number[]) =>
    makeRequest('/compare/save', {
      method: 'POST',
      body: { collegeIds },
    }),

  getSavedComparisons: () => makeRequest('/compare/saved').then((response) =>
    Array.isArray(response) ? response.map(normalizeSavedComparison) : []
  ),

  deleteSavedComparison: (comparisonId: number) =>
    makeRequest(`/compare/saved/${comparisonId}`, {
      method: 'DELETE',
    }),
};

// Q&A APIs
export const qaAPI = {
  getQuestions: (page = 1, limit = 10) =>
    makeRequest(`/qa?page=${page}&limit=${limit}`).then((response) => ({
      ...response,
      data: Array.isArray(response.data) ? response.data.map(normalizeQuestion) : [],
    })),

  getQuestionById: (id: number) => makeRequest(`/qa/${id}`).then(normalizeQuestion),

  createQuestion: (title: string, content: string, tags?: string[]) =>
    makeRequest('/qa', {
      method: 'POST',
      body: { title, content, tags },
    }).then((response) => ({
      ...response,
      question: response.question ? normalizeQuestion(response.question) : undefined,
    })),

  answerQuestion: (questionId: number, content: string) =>
    makeRequest('/qa/answer', {
      method: 'POST',
      body: { questionId, content },
    }).then((response) => ({
      ...response,
      answer: response.answer ? normalizeAnswer(response.answer) : undefined,
    })),

  upvoteAnswer: (answerId: number) =>
    makeRequest('/qa/upvote', {
      method: 'POST',
      body: { answerId },
    }),

  searchQuestions: (query: string) =>
    makeRequest(`/qa/search?query=${encodeURIComponent(query)}`),
};

// Predictor APIs
export const predictorAPI = {
  getExams: () => makeRequest('/predictor/exams'),

  predict: (payload: {
    exam: string;
    rank: number;
  }) =>
    makeRequest('/predictor/predict', {
      method: 'POST',
      body: payload,
    }).then((response) => ({
      ...response,
      colleges: Array.isArray(response.colleges)
        ? response.colleges.map((college: any) => ({
            ...normalizeCollege(college),
            match: college.match ?? 'Tough',
            probability: toNumber(college.probability),
            openingRank: toNumber(college.openingRank ?? college.minRank),
            closingRank: toNumber(college.closingRank ?? college.maxRank),
          }))
        : [],
    })),
};

// Health check
export const healthCheck = () => makeRequest('/health');

export default {
  collegeAPI,
  authAPI,
  compareAPI,
  qaAPI,
  predictorAPI,
  healthCheck,
};
