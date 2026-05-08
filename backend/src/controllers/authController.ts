import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../types/index.js';

interface InMemoryUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  savedColleges: string[];
  createdAt: string;
}

const inMemoryUsers: Map<string, InMemoryUser> = new Map();
let userIdCounter = 1;

const getJwtExpiresIn = (): SignOptions['expiresIn'] =>
  (process.env.JWT_EXPIRE || '7d') as SignOptions['expiresIn'];

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (inMemoryUsers.has(email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user: InMemoryUser = {
      id: userIdCounter++,
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      savedColleges: [],
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.set(email, user);

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
        firstName: user.firstName,
        lastName: user.lastName,
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

    const user = inMemoryUsers.get(email);

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
        firstName: user.firstName,
        lastName: user.lastName,
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

    const user = Array.from(inMemoryUsers.values()).find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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

    const user = Array.from(inMemoryUsers.values()).find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedColleges.includes(String(collegeId))) {
      user.savedColleges.push(String(collegeId));
    }

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

    const user = Array.from(inMemoryUsers.values()).find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedColleges = user.savedColleges.filter(id => id !== String(collegeId));

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

    const user = Array.from(inMemoryUsers.values()).find(u => u.id === req.user!.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.savedColleges.map(id => ({ id })));
  } catch (error) {
    console.error('Get saved colleges error:', error);
    res.status(500).json({ message: 'Failed to fetch saved colleges' });
  }
};

export const getAllUsers = () => Array.from(inMemoryUsers.values());