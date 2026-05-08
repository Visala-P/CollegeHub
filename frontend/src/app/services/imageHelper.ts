export type CollegeCategory = 
  | 'architecture'
  | 'engineering'
  | 'medical'
  | 'technology'
  | 'arts'
  | 'degree'
  | 'university'
  | 'default';

const COLLEGE_IMAGES: Record<CollegeCategory, string> = {
  architecture: '/src/images/Architecture.png',
  engineering: '/src/images/Engineering.png',
  medical: '/src/images/Medical.png',
  university: '/src/images/University.png',
  arts: '/src/images/arts&science.png',
  default: '/src/images/Degree.png',
  degree: '/src/images/Degree.png',
  technology: '/src/images/Engineering.png',
} as const;

export const getCollegeCategory = (collegeName: string): CollegeCategory => {
  const nameLower = collegeName.toLowerCase();

  if (nameLower.includes('architecture')) {
    return 'architecture';
  }

  if (
    nameLower.includes('engineering') ||
    nameLower.includes('technology') ||
    nameLower.includes('tech') ||
    nameLower.includes('nit ') ||
    nameLower.includes(' iit') ||
    nameLower.includes('institute of technology') ||
    nameLower.includes('polytechnic')
  ) {
    return 'engineering';
  }

  if (
    nameLower.includes('medical') ||
    nameLower.includes('health') ||
    nameLower.includes('hospital') ||
    nameLower.includes('aiims') ||
    nameLower.includes('dental')
  ) {
    return 'medical';
  }

  if (
    (nameLower.includes('arts') && nameLower.includes('science')) ||
    nameLower.includes('liberal arts') ||
    nameLower.includes('science') ||
    nameLower.includes('b.sc') ||
    nameLower.includes('b.a')
  ) {
    return 'arts';
  }

  
  if (
    nameLower.includes('university') ||
    nameLower.includes('college of') ||
    nameLower.includes('deemed university')
  ) {
    return 'university';
  }

  return 'default';
};

export const getCollegeImageUrl = (collegeName: string): string => {
  const category: CollegeCategory = getCollegeCategory(collegeName);
  return COLLEGE_IMAGES[category];
};

export const getCollegeImageAlt = (collegeName: string): string => {
  const category = getCollegeCategory(collegeName);
  const categoryLabels: Record<CollegeCategory, string> = {
    architecture: 'Architecture College',
    engineering: 'Engineering College',
    medical: 'Medical College',
    technology: 'Engineering College',
    arts: 'Arts & Science College',
    university: 'University',
    default: 'College',
    degree: 'Degree College',
  };
  return categoryLabels[category];
};