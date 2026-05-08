// Historical JEE/NEET cutoff data for 2023-2025
// This data is used for college predictions based on closing ranks

export type CutoffRecord = {
  collegeId: string;
  collegeName: string;
  branch?: string;
  category: 'OPEN' | 'OBC' | 'SC' | 'ST';
  exam: 'jee-main' | 'jee-advanced' | 'neet';
  year: 2023 | 2024 | 2025;
  openingRank: number;
  closingRank: number;
  state: string;
};

// Sample cutoff data - this should be expanded with real historical data
export const collegeCutoffs: CutoffRecord[] = [
  // IITs - JEE Advanced
  {
    collegeId: 'iit-bombay',
    collegeName: 'IIT Bombay',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 68,
    state: 'Maharashtra',
  },
  {
    collegeId: 'iit-delhi',
    collegeName: 'IIT Delhi',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 145,
    state: 'Delhi',
  },
  {
    collegeId: 'iit-madras',
    collegeName: 'IIT Madras',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 182,
    state: 'Tamil Nadu',
  },
  {
    collegeId: 'iit-kanpur',
    collegeName: 'IIT Kanpur',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 210,
    state: 'Uttar Pradesh',
  },
  {
    collegeId: 'iit-kharagpur',
    collegeName: 'IIT Kharagpur',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 238,
    state: 'West Bengal',
  },
  {
    collegeId: 'iit-roorkee',
    collegeName: 'IIT Roorkee',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 392,
    state: 'Uttarakhand',
  },
  {
    collegeId: 'iit-guwahati',
    collegeName: 'IIT Guwahati',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 586,
    state: 'Assam',
  },
  {
    collegeId: 'iit-hyderabad',
    collegeName: 'IIT Hyderabad',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 748,
    state: 'Telangana',
  },
  {
    collegeId: 'iit-bhu',
    collegeName: 'IIT BHU',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 825,
    state: 'Uttar Pradesh',
  },
  {
    collegeId: 'iit-indore',
    collegeName: 'IIT Indore',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-advanced',
    year: 2025,
    openingRank: 1,
    closingRank: 950,
    state: 'Madhya Pradesh',
  },
  // Sample NIT data - JEE Main
  {
    collegeId: 'nit-trichy',
    collegeName: 'NIT Trichy',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-main',
    year: 2025,
    openingRank: 2000,
    closingRank: 3500,
    state: 'Tamil Nadu',
  },
  {
    collegeId: 'nit-surathkal',
    collegeName: 'NIT Surathkal',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-main',
    year: 2025,
    openingRank: 3000,
    closingRank: 5200,
    state: 'Karnataka',
  },
  {
    collegeId: 'nit-calicut',
    collegeName: 'NIT Calicut',
    branch: 'Computer Science',
    category: 'OPEN',
    exam: 'jee-main',
    year: 2025,
    openingRank: 5000,
    closingRank: 8500,
    state: 'Kerala',
  },
  // Medical colleges - NEET
  {
    collegeId: 'aiims-delhi',
    collegeName: 'AIIMS Delhi',
    branch: 'MBBS',
    category: 'OPEN',
    exam: 'neet',
    year: 2025,
    openingRank: 1,
    closingRank: 150,
    state: 'Delhi',
  },
  {
    collegeId: 'aiims-bombay',
    collegeName: 'AIIMS Bombay',
    branch: 'MBBS',
    category: 'OPEN',
    exam: 'neet',
    year: 2025,
    openingRank: 1,
    closingRank: 250,
    state: 'Maharashtra',
  },
  {
    collegeId: 'maulana-azad',
    collegeName: 'Maulana Azad Medical College',
    branch: 'MBBS',
    category: 'OPEN',
    exam: 'neet',
    year: 2025,
    openingRank: 200,
    closingRank: 400,
    state: 'Delhi',
  },
];

export const getCutoffForCollege = (
  collegeName: string,
  exam: string,
  category: string = 'OPEN',
  year: number = 2025,
): CutoffRecord | undefined => {
  const normalizedExam = exam.toLowerCase().replace(/\s+/g, '-');
  const collegeNameLower = collegeName.toLowerCase();

  return collegeCutoffs.find(
    (cutoff) =>
      cutoff.collegeName.toLowerCase().includes(collegeNameLower) &&
      (cutoff.exam === normalizedExam || cutoff.exam === 'jee-main' || cutoff.exam === 'jee-advanced') &&
      cutoff.category === category &&
      cutoff.year === year,
  );
};

export const getAverageCutoff = (exam: string, category: string = 'OPEN', year: number = 2025): number => {
  const normalizedExam = exam.toLowerCase().replace(/\s+/g, '-');
  const relevantCutoffs = collegeCutoffs.filter((c) => c.exam === normalizedExam && c.category === category && c.year === year);

  if (relevantCutoffs.length === 0) return 10000;

  const total = relevantCutoffs.reduce((sum, c) => sum + c.closingRank, 0);
  return Math.round(total / relevantCutoffs.length);
};
