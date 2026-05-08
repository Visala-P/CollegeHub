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

export interface Question {
  id: string;
  author: string;
  title: string;
  content: string;
  date: string;
  answers: Answer[];
  tags: string[];
}

export interface Answer {
  id: string;
  author: string;
  content: string;
  date: string;
  upvotes: number;
}

export const colleges: College[] = [
  {
    id: "1",
    name: "Indian Institute of Technology, Bombay",
    location: "Powai, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    fees: 200000,
    rating: 4.8,
    courses: ["B.Tech", "M.Tech", "PhD", "MBA"],
    type: "Public",
    established: 1958,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop",
    placementRate: 95,
    averagePackage: 2100000,
    highestPackage: 15000000,
    totalStudents: 10000,
    facultyCount: 650,
    campusSize: "550 acres",
    minRank: 1,
    maxRank: 500,
    description: "IIT Bombay is one of the premier engineering institutions in India, known for its excellence in technical education and research.",
    reviews: [
      {
        id: "r1",
        author: "Rahul Sharma",
        rating: 5,
        date: "2026-03-15",
        comment: "Excellent infrastructure and world-class faculty. Best decision of my life!",
        course: "B.Tech CSE"
      },
      {
        id: "r2",
        author: "Priya Patel",
        rating: 4,
        date: "2026-02-20",
        comment: "Great placement opportunities. Campus life is amazing.",
        course: "M.Tech AI"
      }
    ],
    placements: [
      { year: 2025, company: "Google", package: 15000000, studentsPlaced: 25 },
      { year: 2025, company: "Microsoft", package: 12000000, studentsPlaced: 30 },
      { year: 2024, company: "Amazon", package: 11000000, studentsPlaced: 28 }
    ]
  },
  {
    id: "2",
    name: "Indian Institute of Technology, Delhi",
    location: "Hauz Khas, New Delhi",
    city: "Delhi",
    state: "Delhi",
    fees: 210000,
    rating: 4.7,
    courses: ["B.Tech", "M.Tech", "PhD", "MBA", "MSc"],
    type: "Public",
    established: 1961,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop",
    placementRate: 93,
    averagePackage: 2000000,
    highestPackage: 14500000,
    totalStudents: 9500,
    facultyCount: 600,
    campusSize: "320 acres",
    minRank: 1,
    maxRank: 600,
    description: "IIT Delhi is a leading technical university known for its academic excellence and innovation.",
    reviews: [
      {
        id: "r3",
        author: "Amit Kumar",
        rating: 5,
        date: "2026-01-10",
        comment: "Top-notch research facilities and excellent peer group.",
        course: "B.Tech EE"
      }
    ],
    placements: [
      { year: 2025, company: "Apple", package: 14500000, studentsPlaced: 20 },
      { year: 2025, company: "Goldman Sachs", package: 13000000, studentsPlaced: 22 }
    ]
  },
  {
    id: "3",
    name: "National Institute of Technology, Trichy",
    location: "Tiruchirappalli",
    city: "Trichy",
    state: "Tamil Nadu",
    fees: 150000,
    rating: 4.5,
    courses: ["B.Tech", "M.Tech", "MBA", "MCA"],
    type: "Public",
    established: 1964,
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=400&fit=crop",
    placementRate: 90,
    averagePackage: 1400000,
    highestPackage: 8500000,
    totalStudents: 8000,
    facultyCount: 450,
    campusSize: "800 acres",
    minRank: 500,
    maxRank: 3000,
    description: "NIT Trichy is one of the oldest and most prestigious NITs in India.",
    reviews: [
      {
        id: "r4",
        author: "Deepak Raj",
        rating: 4,
        date: "2026-02-05",
        comment: "Good college with great placement record. Beautiful campus.",
        course: "B.Tech Mech"
      }
    ],
    placements: [
      { year: 2025, company: "Infosys", package: 8500000, studentsPlaced: 45 },
      { year: 2025, company: "TCS", package: 700000, studentsPlaced: 50 }
    ]
  },
  {
    id: "4",
    name: "Birla Institute of Technology and Science, Pilani",
    location: "Pilani",
    city: "Pilani",
    state: "Rajasthan",
    fees: 450000,
    rating: 4.6,
    courses: ["B.E", "M.Tech", "MBA", "PhD"],
    type: "Private",
    established: 1964,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop",
    placementRate: 92,
    averagePackage: 1800000,
    highestPackage: 11000000,
    totalStudents: 18000,
    facultyCount: 800,
    campusSize: "328 acres",
    minRank: 1000,
    maxRank: 5000,
    description: "BITS Pilani is a premier private institute known for its academic rigor and industry connections.",
    reviews: [
      {
        id: "r5",
        author: "Sneha Reddy",
        rating: 5,
        date: "2026-03-01",
        comment: "Excellent academic freedom and no attendance policy. Love the culture!",
        course: "B.E CSE"
      }
    ],
    placements: [
      { year: 2025, company: "Flipkart", package: 11000000, studentsPlaced: 15 },
      { year: 2025, company: "Oracle", package: 9000000, studentsPlaced: 18 }
    ]
  },
  {
    id: "5",
    name: "Delhi Technological University",
    location: "Shahbad Daulatpur, Delhi",
    city: "Delhi",
    state: "Delhi",
    fees: 180000,
    rating: 4.3,
    courses: ["B.Tech", "M.Tech", "MBA"],
    type: "Public",
    established: 1941,
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop",
    placementRate: 85,
    averagePackage: 1200000,
    highestPackage: 7500000,
    totalStudents: 7500,
    facultyCount: 400,
    campusSize: "164 acres",
    minRank: 2000,
    maxRank: 8000,
    description: "DTU is a leading technical university in Delhi with strong industry connections.",
    reviews: [
      {
        id: "r6",
        author: "Vikram Singh",
        rating: 4,
        date: "2026-01-20",
        comment: "Good college in Delhi. Placements are decent. Location advantage!",
        course: "B.Tech IT"
      }
    ],
    placements: [
      { year: 2025, company: "Adobe", package: 7500000, studentsPlaced: 12 },
      { year: 2025, company: "Paytm", package: 6500000, studentsPlaced: 15 }
    ]
  },
  {
    id: "6",
    name: "Vellore Institute of Technology",
    location: "Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    fees: 195000,
    rating: 4.2,
    courses: ["B.Tech", "M.Tech", "MBA", "BBA"],
    type: "Private",
    established: 1984,
    image: "https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&h=400&fit=crop",
    placementRate: 88,
    averagePackage: 1100000,
    highestPackage: 7000000,
    totalStudents: 30000,
    facultyCount: 1500,
    campusSize: "350 acres",
    minRank: 3000,
    maxRank: 15000,
    description: "VIT is a premier private engineering institution with a diverse student body.",
    reviews: [
      {
        id: "r7",
        author: "Anjali Mehta",
        rating: 4,
        date: "2026-02-28",
        comment: "Large campus with good facilities. Many cultural events.",
        course: "B.Tech ECE"
      }
    ],
    placements: [
      { year: 2025, company: "Cognizant", package: 7000000, studentsPlaced: 80 },
      { year: 2025, company: "Wipro", package: 600000, studentsPlaced: 90 }
    ]
  },
  {
    id: "7",
    name: "Manipal Institute of Technology",
    location: "Manipal",
    city: "Manipal",
    state: "Karnataka",
    fees: 350000,
    rating: 4.1,
    courses: ["B.Tech", "M.Tech", "MBA"],
    type: "Private",
    established: 1957,
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=400&fit=crop",
    placementRate: 87,
    averagePackage: 1000000,
    highestPackage: 6500000,
    totalStudents: 6000,
    facultyCount: 350,
    campusSize: "313 acres",
    minRank: 5000,
    maxRank: 20000,
    description: "MIT Manipal is known for its vibrant campus life and quality education.",
    reviews: [
      {
        id: "r8",
        author: "Karthik Iyer",
        rating: 4,
        date: "2026-03-10",
        comment: "Great campus life and good placements. Expensive but worth it.",
        course: "B.Tech CSE"
      }
    ],
    placements: [
      { year: 2025, company: "Accenture", package: 6500000, studentsPlaced: 35 },
      { year: 2025, company: "Capgemini", package: 550000, studentsPlaced: 40 }
    ]
  },
  {
    id: "8",
    name: "Indian Institute of Technology, Madras",
    location: "Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    fees: 200000,
    rating: 4.9,
    courses: ["B.Tech", "M.Tech", "PhD", "MBA"],
    type: "Public",
    established: 1959,
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop",
    placementRate: 96,
    averagePackage: 2200000,
    highestPackage: 16000000,
    totalStudents: 9000,
    facultyCount: 620,
    campusSize: "617 acres",
    minRank: 1,
    maxRank: 450,
    description: "IIT Madras is ranked #1 in India, known for cutting-edge research and innovation.",
    reviews: [
      {
        id: "r9",
        author: "Sundar Rajan",
        rating: 5,
        date: "2026-03-20",
        comment: "Best institute in India. Research opportunities are unmatched.",
        course: "PhD CSE"
      }
    ],
    placements: [
      { year: 2025, company: "Google", package: 16000000, studentsPlaced: 30 },
      { year: 2025, company: "Meta", package: 14000000, studentsPlaced: 25 }
    ]
  },
  {
    id: "9",
    name: "Netaji Subhas University of Technology",
    location: "Dwarka, Delhi",
    city: "Delhi",
    state: "Delhi",
    fees: 165000,
    rating: 4.2,
    courses: ["B.Tech", "M.Tech", "MBA"],
    type: "Public",
    established: 1983,
    image: "https://images.unsplash.com/photo-1556742521-9713bf272865?w=800&h=400&fit=crop",
    placementRate: 83,
    averagePackage: 1050000,
    highestPackage: 6800000,
    totalStudents: 5500,
    facultyCount: 320,
    campusSize: "145 acres",
    minRank: 3000,
    maxRank: 12000,
    description: "NSUT is a reputed engineering college in Delhi with good placement records.",
    reviews: [
      {
        id: "r10",
        author: "Neha Gupta",
        rating: 4,
        date: "2026-02-15",
        comment: "Good faculty and placement opportunities. Campus needs improvement.",
        course: "B.Tech COE"
      }
    ],
    placements: [
      { year: 2025, company: "Samsung", package: 6800000, studentsPlaced: 18 },
      { year: 2025, company: "Uber", package: 5500000, studentsPlaced: 10 }
    ]
  },
  {
    id: "10",
    name: "SRM Institute of Science and Technology",
    location: "Kattankulathur, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    fees: 250000,
    rating: 4.0,
    courses: ["B.Tech", "M.Tech", "MBA", "BBA"],
    type: "Private",
    established: 1985,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    placementRate: 85,
    averagePackage: 900000,
    highestPackage: 6000000,
    totalStudents: 40000,
    facultyCount: 2000,
    campusSize: "250 acres",
    minRank: 8000,
    maxRank: 30000,
    description: "SRM is a large private university with diverse programs and international collaborations.",
    reviews: [
      {
        id: "r11",
        author: "Arjun Nair",
        rating: 4,
        date: "2026-01-30",
        comment: "Good infrastructure. Very large campus with lots of activities.",
        course: "B.Tech CSE"
      }
    ],
    placements: [
      { year: 2025, company: "HCL", package: 6000000, studentsPlaced: 100 },
      { year: 2025, company: "Tech Mahindra", package: 500000, studentsPlaced: 120 }
    ]
  }
];

export const questions: Question[] = [
  {
    id: "q1",
    author: "Rohit Sharma",
    title: "Which is better: IIT Bombay or IIT Delhi for Computer Science?",
    content: "I have ranks that can get me into both IIT Bombay and IIT Delhi for CSE. Which one should I choose and why?",
    date: "2026-04-20",
    tags: ["IIT", "CSE", "Admissions"],
    answers: [
      {
        id: "a1",
        author: "Priya Singh",
        content: "Both are excellent. IIT Bombay has slightly better placements but IIT Delhi has better location advantage. Choose based on your preference.",
        date: "2026-04-21",
        upvotes: 15
      },
      {
        id: "a2",
        author: "Alumni_IITB",
        content: "I'm from IIT Bombay CSE batch of 2024. The research opportunities and startup culture here is amazing. Placement-wise both are equal.",
        date: "2026-04-22",
        upvotes: 23
      }
    ]
  },
  {
    id: "q2",
    author: "Meera Patel",
    title: "NIT Trichy vs BITS Pilani for Mechanical Engineering?",
    content: "I got NIT Trichy Mechanical and BITS Pilani Mechanical. Which one should I prefer considering placements and fees?",
    date: "2026-04-18",
    tags: ["NIT", "BITS", "Mechanical"],
    answers: [
      {
        id: "a3",
        author: "Mechanical_Guy",
        content: "NIT Trichy has better ROI considering the fees difference. BITS fees is 3x of NIT. Both have similar placements.",
        date: "2026-04-19",
        upvotes: 18
      }
    ]
  },
  {
    id: "q3",
    author: "Aditya Kumar",
    title: "How is campus life at VIT Vellore?",
    content: "Can someone share their experience about campus life, events, and hostel facilities at VIT?",
    date: "2026-04-15",
    tags: ["VIT", "Campus Life"],
    answers: [
      {
        id: "a4",
        author: "VIT_Student_2025",
        content: "Campus life is great! Lots of fests like Riviera and Gravitas. Hostel facilities are decent. Food could be better.",
        date: "2026-04-16",
        upvotes: 12
      },
      {
        id: "a5",
        author: "Alumni_VIT",
        content: "VIT has one of the best campus cultures in India. Very diverse crowd and lots of clubs and activities.",
        date: "2026-04-17",
        upvotes: 9
      }
    ]
  },
  {
    id: "q4",
    author: "Kavya Reddy",
    title: "What JEE rank is needed for IIT Madras CSE?",
    content: "I'm targeting IIT Madras CSE. What rank should I aim for to be safe?",
    date: "2026-04-10",
    tags: ["JEE", "IIT Madras", "CSE"],
    answers: [
      {
        id: "a6",
        author: "JEE_Expert",
        content: "For general category, you need around rank 200-300 to be safe. For other categories, it varies.",
        date: "2026-04-11",
        upvotes: 20
      }
    ]
  }
];
