export type CollegeCategory = 
  | 'architecture'
  | 'engineering'
  | 'medical'
  | 'management'
  | 'law'
  | 'arts'
  | 'agriculture'
  | 'pharmacy'
  | 'university'
  | 'default';

export const COLLEGE_IMAGES = {
  architecture: '/src/images/Architecture.png',
  engineering: '/src/images/Engineering.png',
  medical: '/src/images/Medical.png',
  university: '/src/images/University.png',
  arts: '/src/images/arts&science.png',
  default: '/src/images/Degree.png',
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
    nameLower.includes('management') ||
    nameLower.includes('business') ||
    nameLower.includes('mba') ||
    nameLower.includes('commerce')
  ) {
    return 'management';
  }

  if (nameLower.includes('law') || nameLower.includes('legal')) {
    return 'law';
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
    nameLower.includes('agriculture') ||
    nameLower.includes('agri') ||
    nameLower.includes('farming')
  ) {
    return 'agriculture';
  }

  if (
    nameLower.includes('pharmacy') ||
    nameLower.includes('pharma')
  ) {
    return 'pharmacy';
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
  const category = getCollegeCategory(collegeName);
  return COLLEGE_IMAGES[category];
};

export const getCollegeImageAlt = (collegeName: string): string => {
  const category = getCollegeCategory(collegeName);
  const categoryLabels: Record<CollegeCategory, string> = {
    architecture: 'Architecture College',
    engineering: 'Engineering College',
    medical: 'Medical College',
    management: 'Management College',
    law: 'Law College',
    arts: 'Arts & Science College',
    agriculture: 'Agriculture College',
    pharmacy: 'Pharmacy College',
    university: 'University',
    default: 'College',
  };
  return categoryLabels[category];
};