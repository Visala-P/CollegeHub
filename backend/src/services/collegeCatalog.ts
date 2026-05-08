type ExternalCollegeSource = {
  key: string;
  label: string;
  fileName: string;
  feeRange: [number, number];
  averagePackageRange: [number, number];
  highestPackageRange: [number, number];
  placementRange: [number, number];
  studentsRange: [number, number];
  facultyRange: [number, number];
  ratingBase: number;
};

type ExternalCollegeRecord = {
  name?: string;
  city?: string | null;
  state?: string | null;
  rank?: number | string | null;
};

export type CollegeRecord = {
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
  reviews: unknown[];
  placements: unknown[];
};

type CollegeCatalog = {
  colleges: CollegeRecord[];
  states: string[];
  courses: string[];
  loadedAt: number;
};

const COLLEGE_API_BASE_URL = process.env.COLLEGE_API_BASE_URL || 'https://collegeapi.onrender.com/api';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const sources: ExternalCollegeSource[] = [
  {
    key: 'general',
    label: 'General',
    fileName: 'colleges',
    feeRange: [30000, 180000],
    averagePackageRange: [250000, 800000],
    highestPackageRange: [600000, 2200000],
    placementRange: [45, 95],
    studentsRange: [1200, 22000],
    facultyRange: [50, 900],
    ratingBase: 4.0,
  },
  {
    key: 'engineering',
    label: 'Engineering',
    fileName: 'engineering_colleges',
    feeRange: [70000, 300000],
    averagePackageRange: [400000, 1500000],
    highestPackageRange: [1000000, 4000000],
    placementRange: [60, 98],
    studentsRange: [1500, 28000],
    facultyRange: [80, 1200],
    ratingBase: 4.2,
  },
  {
    key: 'medical',
    label: 'Medical',
    fileName: 'medical_colleges',
    feeRange: [150000, 800000],
    averagePackageRange: [500000, 1800000],
    highestPackageRange: [1200000, 4500000],
    placementRange: [55, 96],
    studentsRange: [500, 12000],
    facultyRange: [100, 1600],
    ratingBase: 4.3,
  },
  {
    key: 'management',
    label: 'Management',
    fileName: 'management_colleges',
    feeRange: [100000, 500000],
    averagePackageRange: [500000, 1800000],
    highestPackageRange: [1200000, 3500000],
    placementRange: [55, 97],
    studentsRange: [300, 8000],
    facultyRange: [30, 500],
    ratingBase: 4.1,
  },
  {
    key: 'architecture',
    label: 'Architecture',
    fileName: 'architecture_colleges',
    feeRange: [80000, 350000],
    averagePackageRange: [400000, 1400000],
    highestPackageRange: [1000000, 3000000],
    placementRange: [50, 94],
    studentsRange: [250, 6000],
    facultyRange: [25, 350],
    ratingBase: 4.0,
  },
  {
    key: 'law',
    label: 'Law',
    fileName: 'law_colleges',
    feeRange: [30000, 200000],
    averagePackageRange: [300000, 1000000],
    highestPackageRange: [700000, 2500000],
    placementRange: [45, 93],
    studentsRange: [300, 9000],
    facultyRange: [20, 250],
    ratingBase: 4.0,
  },
  {
    key: 'dental',
    label: 'Dental',
    fileName: 'dental_colleges',
    feeRange: [150000, 700000],
    averagePackageRange: [450000, 1400000],
    highestPackageRange: [1000000, 3000000],
    placementRange: [50, 95],
    studentsRange: [150, 5000],
    facultyRange: [30, 400],
    ratingBase: 4.1,
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    fileName: 'pharmacy_colleges',
    feeRange: [80000, 250000],
    averagePackageRange: [350000, 1200000],
    highestPackageRange: [800000, 2500000],
    placementRange: [50, 94],
    studentsRange: [200, 6000],
    facultyRange: [25, 300],
    ratingBase: 4.0,
  },
  {
    key: 'research',
    label: 'Research',
    fileName: 'research_colleges',
    feeRange: [20000, 120000],
    averagePackageRange: [300000, 1000000],
    highestPackageRange: [700000, 2200000],
    placementRange: [45, 90],
    studentsRange: [100, 8000],
    facultyRange: [20, 500],
    ratingBase: 4.2,
  },
  {
    key: 'university',
    label: 'University',
    fileName: 'universities',
    feeRange: [50000, 250000],
    averagePackageRange: [400000, 1400000],
    highestPackageRange: [1000000, 3200000],
    placementRange: [50, 96],
    studentsRange: [1000, 35000],
    facultyRange: [100, 2000],
    ratingBase: 4.2,
  },
];

const imagePool = [
  'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1482731215275-a1f0e9d4a8c8?w=640&h=360&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=640&h=360&fit=crop&auto=format&q=60',
];

let catalogCache: CollegeCatalog | null = null;
let catalogPromise: Promise<CollegeCatalog> | null = null;

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const pickFromRange = (seed: number, range: [number, number]) => {
  const [min, max] = range;
  if (max <= min) {
    return min;
  }

  return min + (seed % (max - min + 1));
};

const pickImage = (seed: number) => imagePool[seed % imagePool.length];

const buildCollegeRecord = (
  source: ExternalCollegeSource,
  entry: ExternalCollegeRecord,
  index: number,
  seenIds: Set<string>,
): CollegeRecord => {
  const name = normalizeText(entry.name) || `${source.label} College ${index + 1}`;
  const city = normalizeText(entry.city);
  const state = normalizeText(entry.state);
  const seedValue = hashString(`${source.key}:${name}:${city}:${state}:${index}`);
  const baseId = `${source.key}-${slugify(name) || 'college'}-${slugify(city) || 'city'}-${slugify(state) || 'state'}`;
  let id = baseId;
  let suffix = 2;

  while (seenIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  seenIds.add(id);

  const rating = Math.min(5, Number((source.ratingBase + (seedValue % 10) / 20).toFixed(1)));
  const fees = pickFromRange(seedValue, source.feeRange);
  const placementRate = pickFromRange(seedValue + 11, source.placementRange);
  const averagePackage = pickFromRange(seedValue + 23, source.averagePackageRange);
  const highestPackage = Math.max(averagePackage + 200000, pickFromRange(seedValue + 31, source.highestPackageRange));

  return {
    id,
    name,
    location: city ? `${city}, ${state || 'India'}` : state || 'India',
    city: city || state || 'India',
    state: state || 'India',
    fees,
    rating,
    courses: [source.label],
    type: source.label,
    established: 1950 + (seedValue % 75),
    image: pickImage(seedValue),
    placementRate,
    averagePackage,
    highestPackage,
    totalStudents: pickFromRange(seedValue + 7, source.studentsRange),
    facultyCount: pickFromRange(seedValue + 13, source.facultyRange),
    campusSize: `${80 + (seedValue % 900)} acres`,
    minRank: 1 + (seedValue % 5000),
    maxRank: 1000 + (seedValue % 9000),
    description: `${name} is listed in the CollegeAPI dataset under ${source.label.toLowerCase()} colleges in India.`,
    reviews: [],
    placements: [],
  };
};

const fetchSource = async (source: ExternalCollegeSource) => {
  const url = `${COLLEGE_API_BASE_URL}/${source.fileName}?page=1&limit=1000`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.fileName} from collegeAPI (${response.status})`);
  }

  const payload: any = await response.json();
  
  // collegeAPI returns data in different formats depending on endpoint
  // Some return array directly, some wrap in an object
  if (Array.isArray(payload)) {
    return payload as ExternalCollegeRecord[];
  }
  
  if (payload && typeof payload === 'object') {
    // Handle wrapped responses like { data: [...] } or { colleges: [...] }
    if (Array.isArray(payload.data)) return payload.data as ExternalCollegeRecord[];
    if (Array.isArray(payload.colleges)) return payload.colleges as ExternalCollegeRecord[];
    if (Array.isArray(payload.result)) return payload.result as ExternalCollegeRecord[];
  }
  
  return [];
};

const loadCollegeCatalog = async (): Promise<CollegeCatalog> => {
  if (catalogCache && Date.now() - catalogCache.loadedAt < CACHE_TTL_MS) {
    return catalogCache;
  }

  if (catalogPromise) {
    return catalogPromise;
  }

  catalogPromise = (async () => {
    const results = await Promise.allSettled(sources.map(async (source) => ({
      source,
      records: await fetchSource(source),
    })));

    const seenIds = new Set<string>();
    const colleges: CollegeRecord[] = [];

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('College catalog source failed:', result.reason);
        continue;
      }

      const { source, records } = result.value;
      records.forEach((record, index) => {
        colleges.push(buildCollegeRecord(source, record, index, seenIds));
      });
    }

    const iitSamples = [
      { name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra' },
      { name: 'IIT Delhi', city: 'New Delhi', state: 'Delhi' },
      { name: 'IIT Madras', city: 'Chennai', state: 'Tamil Nadu' },
      { name: 'IIT Kanpur', city: 'Kanpur', state: 'Uttar Pradesh' },
      { name: 'IIT Kharagpur', city: 'Kharagpur', state: 'West Bengal' },
      { name: 'IIT Roorkee', city: 'Roorkee', state: 'Uttarakhand' },
      { name: 'IIT Guwahati', city: 'Guwahati', state: 'Assam' },
      { name: 'IIT Hyderabad', city: 'Hyderabad', state: 'Telangana' },
      { name: 'IIT BHU', city: 'Varanasi', state: 'Uttar Pradesh' },
      { name: 'IIT Indore', city: 'Indore', state: 'Madhya Pradesh' },
      { name: 'IIT Ropar', city: 'Rupnagar', state: 'Punjab' },
      { name: 'IIT Gandhinagar', city: 'Gandhinagar', state: 'Gujarat' },
      { name: 'IIT Jodhpur', city: 'Jodhpur', state: 'Rajasthan' },
      { name: 'IIT Patna', city: 'Patna', state: 'Bihar' },
      { name: 'IIT Mandi', city: 'Mandi', state: 'Himachal Pradesh' },
      { name: 'IIT Palakkad', city: 'Palakkad', state: 'Kerala' },
      { name: 'IIT Tirupati', city: 'Tirupati', state: 'Andhra Pradesh' },
      { name: 'IIT Bhilai', city: 'Bhilai', state: 'Chhattisgarh' },
      { name: 'IIT Jammu', city: 'Jammu', state: 'Jammu and Kashmir' },
      { name: 'IIT Dharwad', city: 'Dharwad', state: 'Karnataka' },
      { name: 'IIT (ISM) Dhanbad', city: 'Dhanbad', state: 'Jharkhand' },
      { name: 'IIT Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha' },
      { name: 'IIT Goa', city: 'Ponda', state: 'Goa' },
    ];

    iitSamples.forEach((sample, idx) => {
      const alreadyPresent = colleges.some((college) => college.name.toLowerCase().includes(sample.name.toLowerCase().replace(/^iit\s*\(?ism\)?\s*/i, '')) || college.name.toLowerCase() === sample.name.toLowerCase());

      if (alreadyPresent) {
        return;
      }

      const seedValue = hashString(`iit:${sample.name}:${idx}`);
      const baseId = `iit-${slugify(sample.name)}-${slugify(sample.city || '')}`;
      let id = baseId;
      let suffix = 2;
      while (seenIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
      seenIds.add(id);

      colleges.push({
        id,
        name: sample.name,
        location: `${sample.city}, ${sample.state}`,
        city: sample.city,
        state: sample.state,
        fees: pickFromRange(seedValue, sources[1].feeRange),
        rating: 4.9,
        courses: ['Engineering'],
        type: 'Engineering',
        established: 1950 + (seedValue % 75),
        image: pickImage(seedValue),
        placementRate: 98,
        averagePackage: pickFromRange(seedValue + 23, sources[1].averagePackageRange) + 1000000,
        highestPackage: pickFromRange(seedValue + 31, sources[1].highestPackageRange) + 2000000,
        totalStudents: pickFromRange(seedValue + 7, sources[1].studentsRange),
        facultyCount: pickFromRange(seedValue + 13, sources[1].facultyRange),
        campusSize: `${200 + (seedValue % 900)} acres`,
        minRank: 1,
        maxRank: 3000,
        description: `${sample.name} (Indian Institute of Technology) synthetic sample for predictions.`,
        reviews: [],
        placements: [],
      });
    });

    colleges.sort((left, right) => left.name.localeCompare(right.name));

    const states = Array.from(new Set(colleges.map((college) => college.state).filter(Boolean))).sort();
    const courses = Array.from(new Set(sources.map((source) => source.label))).sort();

    catalogCache = {
      colleges,
      states,
      courses,
      loadedAt: Date.now(),
    };

    return catalogCache;
  })();

  try {
    return await catalogPromise;
  } finally {
    catalogPromise = null;
  }
};

const matchesFilters = (college: CollegeRecord, filters: {
  search?: string;
  state?: string;
  course?: string;
  minFees?: number;
  maxFees?: number;
}) => {
  const search = normalizeText(filters.search).toLowerCase();

  if (search) {
    const haystack = [college.name, college.location, college.city, college.state, college.type].join(' ').toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  const state = normalizeText(filters.state).toLowerCase();
  if (state && college.state.toLowerCase() !== state) {
    return false;
  }

  const course = normalizeText(filters.course).toLowerCase();
  if (course && !college.courses.some((item) => item.toLowerCase() === course)) {
    return false;
  }

  if (filters.minFees != null && college.fees < filters.minFees) {
    return false;
  }

  if (filters.maxFees != null && college.fees > filters.maxFees) {
    return false;
  }

  return true;
};

export const getCollegeCatalog = async () => loadCollegeCatalog();

export const queryColleges = async (filters: {
  search?: string;
  state?: string;
  course?: string;
  minFees?: string;
  maxFees?: string;
}) => {
  const catalog = await loadCollegeCatalog();
  const minFees = filters.minFees ? Number.parseInt(filters.minFees, 10) : undefined;
  const maxFees = filters.maxFees ? Number.parseInt(filters.maxFees, 10) : undefined;

  return catalog.colleges.filter((college) => matchesFilters(college, {
    search: filters.search,
    state: filters.state,
    course: filters.course,
    minFees: Number.isNaN(minFees ?? Number.NaN) ? undefined : minFees,
    maxFees: Number.isNaN(maxFees ?? Number.NaN) ? undefined : maxFees,
  }));
};

export const paginateColleges = (colleges: CollegeRecord[], page: number, limit: number) => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const offset = (safePage - 1) * safeLimit;
  const data = colleges.slice(offset, offset + safeLimit);

  return {
    data,
    total: colleges.length,
    page: safePage,
    limit: safeLimit,
    pages: Math.max(1, Math.ceil(colleges.length / safeLimit)),
  };
};

export const getCollegeByIdFromCatalog = async (id: string) => {
  const catalog = await loadCollegeCatalog();
  return catalog.colleges.find((college) => college.id === id) ?? null;
};

export const getCatalogFilters = async () => {
  const catalog = await loadCollegeCatalog();

  return {
    states: catalog.states,
    courses: catalog.courses,
    fees: catalog.colleges.length > 0
      ? {
          min: Math.min(...catalog.colleges.map((college) => college.fees)),
          max: Math.max(...catalog.colleges.map((college) => college.fees)),
        }
      : {
          min: null,
          max: null,
        },
  };
};