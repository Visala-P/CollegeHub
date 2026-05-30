import { Collection, Db } from 'mongodb';
import dotenv from 'dotenv';
import type { Answer, College, Comparison, Placement, Question, Review, User } from '../types/index.js';
import mongoose from "mongoose";
dotenv.config();

export interface MongoCollege extends College {
  created_at: string;
  updated_at: string;
  courses: string[];
  reviews: Review[];
  placements: Placement[];
}

export interface MongoUser extends User {
  password: string;
  first_name: string;
  last_name: string;
  saved_college_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface MongoComparison extends Comparison {}

export interface MongoQuestion extends Question {
  created_at: string;
  updated_at: string;
  answers: Answer[];
}

export interface CounterDocument {
  _id: string;
  sequence_value: number;
}

type DatabaseCollections = {
  users: Collection<MongoUser>;
  colleges: Collection<MongoCollege>;
  comparisons: Collection<MongoComparison>;
  questions: Collection<MongoQuestion>;
  counters: Collection<CounterDocument>;
};

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB || process.env.DB_NAME || 'college_discovery_platform';

let database: any = null;
let connectPromise: Promise<Db> | null = null;

function createCollections(currentDb: Db): DatabaseCollections {
  return {
    users: currentDb.collection<MongoUser>('users'),
    colleges: currentDb.collection<MongoCollege>('colleges'),
    comparisons: currentDb.collection<MongoComparison>('comparisons'),
    questions: currentDb.collection<MongoQuestion>('questions'),
    counters: currentDb.collection<CounterDocument>('counters'),
  };
}

async function ensureIndexes(currentDb: Db) {
  const { users, colleges, comparisons, questions } = createCollections(currentDb);

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ saved_college_ids: 1 }),
    colleges.createIndex({ id: 1 }, { unique: true }),
    colleges.createIndex({ name: 1 }),
    colleges.createIndex({ state: 1 }),
    colleges.createIndex({ city: 1 }),
    comparisons.createIndex({ id: 1 }, { unique: true }),
    comparisons.createIndex({ user_id: 1, created_at: -1 }),
    questions.createIndex({ id: 1 }, { unique: true }),
    questions.createIndex({ author_id: 1 }),
    questions.createIndex({ title: 'text', content: 'text', tags: 'text' }),
  ]);
}


export async function connectDatabase() {
  if (database) {
    return database;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = mongoose
    .connect(mongoUri, { dbName: databaseName })
    .then(async () => {
      database = mongoose.connection.db!;
      console.log(`MongoDB connected: ${database.databaseName}`);

      await ensureIndexes(database);

      return database;
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error);
      throw error;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}
export function getDatabase() {
  if (!database) {
    throw new Error('MongoDB database has not been initialized');
  }

  return database;
}

export function getCollections() {
  const collections = createCollections(getDatabase());

  console.log("Collections initialized");
  console.log("College collection:", collections.colleges.collectionName);

  return collections;
}
export async function nextSequence(sequenceName: string) {
  const { counters } = getCollections();
  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  return result?.sequence_value ?? 1;
}

export async function resetCollections() {
  const { users, colleges, comparisons, questions, counters } = getCollections();

  await Promise.all([
    users.deleteMany({}),
    colleges.deleteMany({}),
    comparisons.deleteMany({}),
    questions.deleteMany({}),
    counters.deleteMany({}),
  ]);
}

export async function closeDatabase() {
  await mongoose.disconnect();
  database = null;
  connectPromise = null;
}
