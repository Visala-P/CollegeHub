import { Response } from 'express';
import { AuthRequest } from '../types/index.js';

interface Answer {
  id: number;
  questionId: number;
  authorId: number | null;
  author: string;
  content: string;
  date: string;
  upvotes: number;
}

interface Question {
  id: number;
  authorId: number | null;
  author: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  answers: Answer[];
}

const questions: Question[] = [];
let questionIdCounter = 1;
let answerIdCounter = 1;

const sortAnswers = (answers: Answer[]) => [...answers].sort((a, b) => b.upvotes - a.upvotes);

export const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;

    const pageNumber = Number.parseInt(page as string, 10);
    const pageSize = Number.parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageSize;

    const total = questions.length;
    const result = questions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + pageSize)
      .map(q => ({
        id: q.id,
        author: q.author,
        title: q.title,
        content: q.content,
        date: q.date,
        tags: q.tags,
        answers: sortAnswers(q.answers),
        answersCount: q.answers.length,
      }));

    res.json({
      data: result,
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: AuthRequest, res: Response) => {
  try {
    const questionId = Number.parseInt(req.params.id, 10);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      id: question.id,
      author: question.author,
      title: question.title,
      content: question.content,
      date: question.date,
      tags: question.tags,
      answers: sortAnswers(question.answers),
      answersCount: question.answers.length,
    });
  } catch (error) {
    console.error('Get question by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
};

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const now = new Date().toISOString();
    const question: Question = {
      id: questionIdCounter++,
      authorId: req.user?.id || null,
      author: req.user?.email || 'Anonymous',
      title,
      content,
      date: now,
      createdAt: now,
      updatedAt: now,
      tags: Array.isArray(tags) ? tags : [],
      answers: [],
    };

    questions.push(question);

    res.status(201).json({
      message: 'Question created successfully',
      question: {
        id: question.id,
        author: question.author,
        title: question.title,
        content: question.content,
        date: question.date,
        tags: question.tags,
        answers: [],
        answersCount: 0,
      },
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Failed to create question' });
  }
};

export const answerQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { questionId, content } = req.body;
    const questionIdNumber = Number.parseInt(String(questionId), 10);

    if (!questionId || !content) {
      return res.status(400).json({ message: 'Question ID and content are required' });
    }

    const question = questions.find(q => q.id === questionIdNumber);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const now = new Date().toISOString();
    const answer: Answer = {
      id: answerIdCounter++,
      questionId: questionIdNumber,
      authorId: req.user?.id || null,
      author: req.user?.email || 'Anonymous',
      content,
      date: now,
      upvotes: 0,
    };

    question.answers.push(answer);
    question.updatedAt = now;

    res.status(201).json({
      message: 'Answer posted successfully',
      answer,
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ message: 'Failed to post answer' });
  }
};

export const upvoteAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { answerId } = req.body;
    const answerIdNumber = Number.parseInt(String(answerId), 10);

    if (!answerId) {
      return res.status(400).json({ message: 'Answer ID is required' });
    }

    let updatedAnswer: Answer | null = null;

    for (const question of questions) {
      const answer = question.answers.find(a => a.id === answerIdNumber);
      if (answer) {
        answer.upvotes++;
        updatedAnswer = answer;
        break;
      }
    }

    if (!updatedAnswer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    res.json({
      message: 'Answer upvoted successfully',
      answer: updatedAnswer,
    });
  } catch (error) {
    console.error('Upvote answer error:', error);
    res.status(500).json({ message: 'Failed to upvote answer' });
  }
};

export const searchQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const queryLower = query.toLowerCase();
    const result = questions
      .filter(q => 
        q.title.toLowerCase().includes(queryLower) || 
        q.content.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(q => ({
        id: q.id,
        author: q.author,
        title: q.title,
        content: q.content,
        date: q.date,
        tags: q.tags,
        answers: sortAnswers(q.answers),
        answersCount: q.answers.length,
      }));

    res.json(result);
  } catch (error) {
    console.error('Search questions error:', error);
    res.status(500).json({ message: 'Failed to search questions' });
  }
};