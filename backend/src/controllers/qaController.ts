import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { connectDatabase, getCollections, nextSequence } from '../db/config.js';

interface AnswerDocument {
  id: number;
  question_id: number;
  author_id: number | null;
  author: string;
  content: string;
  date: string;
  upvotes: number;
}

interface QuestionDocument {
  id: number;
  author_id: number | null;
  author: string;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  answers: AnswerDocument[];
}

const sortAnswers = (answers: AnswerDocument[]) => [...answers].sort((left, right) => right.upvotes - left.upvotes);

const formatQuestion = (question: QuestionDocument) => ({
  id: question.id,
  author: question.author,
  title: question.title,
  content: question.content,
  date: question.date,
  tags: question.tags ?? [],
  answers: sortAnswers(question.answers ?? []),
  answersCount: question.answers?.length ?? 0,
});

const parsePositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getQuestions = async (req: AuthRequest, res: Response) => {
  try {
    await connectDatabase();

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);
    const offset = (page - 1) * limit;

    const { questions } = getCollections();
    const total = await questions.countDocuments();
    const docs = await questions
      .find({})
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.json({
      data: docs.map((question) => formatQuestion(question as QuestionDocument)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: AuthRequest, res: Response) => {
  try {
    await connectDatabase();

    const questionId = Number.parseInt(req.params.id, 10);
    const { questions } = getCollections();
    const question = await questions.findOne({ id: questionId });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(formatQuestion(question as QuestionDocument));
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

    await connectDatabase();
    const { questions } = getCollections();
    const now = new Date().toISOString();

    const question: QuestionDocument = {
      id: await nextSequence('questions'),
      author_id: req.user?.id || null,
      author: req.user?.email || 'Anonymous',
      title,
      content,
      date: now,
      created_at: now,
      updated_at: now,
      tags: Array.isArray(tags) ? tags : [],
      answers: [],
    };

    await questions.insertOne(question);

    res.status(201).json({
      message: 'Question created successfully',
      question: formatQuestion(question),
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

    await connectDatabase();
    const { questions } = getCollections();
    const question = await questions.findOne({ id: questionIdNumber });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const now = new Date().toISOString();
    const answer: AnswerDocument = {
      id: await nextSequence('answers'),
      question_id: questionIdNumber,
      author_id: req.user?.id || null,
      author: req.user?.email || 'Anonymous',
      content,
      date: now,
      upvotes: 0,
    };

    await questions.updateOne(
      { id: questionIdNumber },
      {
        $push: { answers: answer },
        $set: { updated_at: now },
      },
    );

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

    await connectDatabase();
    const { questions } = getCollections();

    const updateResult = await questions.updateOne(
      { 'answers.id': answerIdNumber },
      { $inc: { 'answers.$[answer].upvotes': 1 } },
      { arrayFilters: [{ 'answer.id': answerIdNumber }] },
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const updatedQuestion = await questions.findOne({ 'answers.id': answerIdNumber });
    const updatedAnswer = updatedQuestion?.answers?.find((answer) => answer.id === answerIdNumber);

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
    await connectDatabase();

    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const { questions } = getCollections();
    const docs = await questions
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $elemMatch: { $regex: query, $options: 'i' } } },
        ],
      })
      .sort({ created_at: -1 })
      .limit(20)
      .toArray();

    res.json(docs.map((question) => formatQuestion(question as QuestionDocument)));
  } catch (error) {
    console.error('Search questions error:', error);
    res.status(500).json({ message: 'Failed to search questions' });
  }
};