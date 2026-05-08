import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export interface College {
  id: number;
  name: string;
  location: string;
  city: string;
  state: string;
  fees: number;
  rating: number;
  type: string;
  established: number;
  image: string;
  placement_rate: number;
  average_package: number;
  highest_package: number;
  total_students: number;
  faculty_count: number;
  campus_size: string;
  min_rank: number;
  max_rank: number;
  description: string;
  courses?: string[];
  reviews?: Review[];
  placements?: Placement[];
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  course: string;
  date: string;
}

export interface Placement {
  id: number;
  year: number;
  company: string;
  package: number;
  students_placed: number;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  savedCollegeIds?: number[];
}

export interface Question {
  id: number;
  author_id: number | null;
  author: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  answers?: Answer[];
}

export interface Answer {
  id: number;
  question_id?: number;
  author_id?: number | null;
  author: string;
  content: string;
  date: string;
  upvotes: number;
}

export interface Comparison {
  id: number;
  user_id: number;
  college_ids: number[];
  created_at: string;
}
