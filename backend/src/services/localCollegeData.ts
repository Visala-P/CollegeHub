import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CollegeData {
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
}

interface RawCollegeEntry {
  name?: string;
  city?: string | null;
  state?: string | null;
  rank?: number | string | null;
}

const DATA_DIR = path.join(__dirname, '../../data');

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

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickFromRange = (seed: number, min: number, max: number): number => {
  if (max <= min) return min;
  return min + (seed % (max - min + 1));
};

const getCollegeCategory = (name: string): string => {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('architecture')) return 'Architecture';
  if (nameLower.includes('engineering') || nameLower.includes('technology') || nameLower.includes('nit') || nameLower.includes('iit')) return 'Engineering';
  if (nameLower.includes('medical') || nameLower.includes('dental') || nameLower.includes('aiims')) return 'Medical';
  if (nameLower.includes('management') || nameLower.includes('business') || nameLower.includes('mba')) return 'Management';
  if (nameLower.includes('law') || nameLower.includes('legal')) return 'Law';
  if (nameLower.includes('arts') || nameLower.includes('science')) return 'Arts & Science';
  if (nameLower.includes('pharmacy') || nameLower.includes('pharma')) return 'Pharmacy';
  if (nameLower.includes('university')) return 'University';
  if (nameLower.includes('agriculture')) return 'Agriculture';
  return 'General';
};

const buildCollegeRecord = (entry: RawCollegeEntry, index: number): CollegeData => {
  const name = normalizeText(entry.name) || `College ${index + 1}`;
  const city = normalizeText(entry.city) || 'Unknown';
  const state = normalizeText(entry.state) || 'Unknown';
  const seedValue = hashString(`${name}:${city}:${state}:${index}`);
  
  const category = getCollegeCategory(name);
  
  return {
    id: `col-${index + 1}`,
    name,
    location: `${city}, ${state}`,
    city,
    state,
    fees: pickFromRange(seedValue, 30000, 500000),
    rating: Number((4.0 + (seedValue % 20) / 50).toFixed(1)),
    courses: [category],
    type: category,
    established: 1950 + (seedValue % 75),
    image: imagePool[seedValue % imagePool.length],
    placementRate: pickFromRange(seedValue, 50, 98),
    averagePackage: pickFromRange(seedValue, 300000, 2000000),
    highestPackage: pickFromRange(seedValue, 600000, 5000000),
    totalStudents: pickFromRange(seedValue, 500, 25000),
    facultyCount: pickFromRange(seedValue, 50, 1000),
    campusSize: `${pickFromRange(seedValue, 50, 800)} acres`,
    minRank: 1 + (seedValue % 5000),
    maxRank: 1000 + (seedValue % 15000),
    description: `${name} is a ${category} college located in ${city}, ${state}.`,
    reviews: [],
    placements: [],
  };
};

let collegesCache: CollegeData[] | null = null;

export const loadAllColleges = (): CollegeData[] => {
  if (collegesCache) {
    return collegesCache;
  }

  const dataFiles = [
    'engineering_participated.json',
    'medical_participated.json',
    'management_participated.json',
    'pharmacy_participated.json',
    'dental_participated.json',
    'architecture_participated.json',
    'college_participated.json',
    'law_participated.json',
    'university_ranking.json',
  ];

  const allColleges: CollegeData[] = [];
  let index = 0;

  for (const file of dataFiles) {
    const filePath = path.join(DATA_DIR, file);
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data: RawCollegeEntry[] = JSON.parse(content);
        
        for (const entry of data) {
          allColleges.push(buildCollegeRecord(entry, index));
          index++;
        }
        
        console.log(`Loaded ${data.length} colleges from ${file}`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  collegesCache = allColleges;
  console.log(`Total colleges loaded: ${allColleges.length}`);
  
  return allColleges;
};

export const getCollegesByPage = (page: number, limit: number): { data: CollegeData[]; total: number; page: number; limit: number; pages: number } => {
  const colleges = loadAllColleges();
  const offset = (page - 1) * limit;
  const data = colleges.slice(offset, offset + limit);
  
  return {
    data,
    total: colleges.length,
    page,
    limit,
    pages: Math.ceil(colleges.length / limit),
  };
};

export const searchColleges = (query: string, page: number = 1, limit: number = 6): { data: CollegeData[]; total: number; page: number; limit: number; pages: number } => {
  const colleges = loadAllColleges();
  const queryLower = query.toLowerCase();
  
  const filtered = colleges.filter(college => 
    college.name.toLowerCase().includes(queryLower) ||
    college.city.toLowerCase().includes(queryLower) ||
    college.state.toLowerCase().includes(queryLower)
  );
  
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);
  
  return {
    data,
    total: filtered.length,
    page,
    limit,
    pages: Math.ceil(filtered.length / limit),
  };
};

export const getCollegeById = (id: string): CollegeData | undefined => {
  const colleges = loadAllColleges();
  return colleges.find(college => college.id === id);
};

export const getFilters = () => {
  const colleges = loadAllColleges();
  
  const states = Array.from(new Set(colleges.map(c => c.state))).sort();
  const courses = Array.from(new Set(colleges.map(c => c.type))).sort();
  
  const fees = colleges.length > 0 ? {
    min: Math.min(...colleges.map(c => c.fees)),
    max: Math.max(...colleges.map(c => c.fees)),
  } : { min: 0, max: 0 };
  
  return { states, courses, fees };
};

export const filterColleges = (filters: {
  state?: string;
  course?: string;
  minFees?: number;
  maxFees?: number;
}, page: number = 1, limit: number = 6): { data: CollegeData[]; total: number; page: number; limit: number; pages: number } => {
  const colleges = loadAllColleges();
  
  let filtered = [...colleges];
  
  if (filters.state) {
    filtered = filtered.filter(c => c.state.toLowerCase() === filters.state!.toLowerCase());
  }
  
  if (filters.course) {
    filtered = filtered.filter(c => c.type.toLowerCase() === filters.course!.toLowerCase());
  }
  
  if (filters.minFees != null) {
    filtered = filtered.filter(c => c.fees >= filters.minFees!);
  }
  
  if (filters.maxFees != null) {
    filtered = filtered.filter(c => c.fees <= filters.maxFees!);
  }
  
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);
  
  return {
    data,
    total: filtered.length,
    page,
    limit,
    pages: Math.ceil(filtered.length / limit),
  };
};