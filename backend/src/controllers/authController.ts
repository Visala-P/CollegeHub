import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../types/index.js';
import { connectDatabase, getCollections, nextSequence, type MongoUser } from '../db/config.js';

const getJwtExpiresIn = (): SignOptions['expiresIn'] =>
  (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'];

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    await connectDatabase();
    const { users } = getCollections();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await users.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const now = new Date().toISOString();

    const user: MongoUser = {
      id: await nextSequence('users'),
      email: normalizedEmail,
      password: hashedPassword,
      first_name: firstName || '',
      last_name: lastName || '',
      saved_college_ids: [],
      created_at: now,
      updated_at: now,
    };

    await users.insertOne(user);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'collegehub-secret-key-2024',
      { expiresIn: getJwtExpiresIn() }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    await connectDatabase();
    const { users } = getCollections();

    const user = await users.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'collegehub-secret-key-2024',
      { expiresIn: getJwtExpiresIn() }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDatabase();
    const { users } = getCollections();

    const user = await users.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const saveCollege = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { collegeId } = req.body;

    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    await connectDatabase();
    const { users } = getCollections();

    const user = await users.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await users.updateOne(
      { id: req.user.id },
      {
        $addToSet: { saved_college_ids: Number.parseInt(String(collegeId), 10) },
        $set: { updated_at: new Date().toISOString() },
      },
    );

    res.json({ message: 'College saved successfully' });
  } catch (error) {
    console.error('Save college error:', error);
    res.status(500).json({ message: 'Failed to save college' });
  }
};

export const unsaveCollege = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { collegeId } = req.body;

    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    await connectDatabase();
    const { users } = getCollections();

    const user = await users.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await users.updateOne(
      { id: req.user.id },
      {
        $pull: { saved_college_ids: Number.parseInt(String(collegeId), 10) },
        $set: { updated_at: new Date().toISOString() },
      },
    );

    res.json({ message: 'College unsaved successfully' });
  } catch (error) {
    console.error('Unsave college error:', error);
    res.status(500).json({ message: 'Failed to unsave college' });
  }
};

export const getSavedColleges = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDatabase();
    const { users } = getCollections();

    const user = await users.findOne({ id: req.user.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json((user.saved_college_ids ?? []).map((id) => ({ id })));
  } catch (error) {
    console.error('Get saved colleges error:', error);
    res.status(500).json({ message: 'Failed to fetch saved colleges' });
  }
};