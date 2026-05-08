import { Collection, Db, MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import type { Answer, College, Comparison, Placement, Question, Review, User } from '../types/index.js';

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
  savedCollegeIds: number[];
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

let client: MongoClient | null = null;
let database: Db | null = null;
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
    colleges.createIndex({ id: 1 }, { unique: true }),
    colleges.createIndex({ name: 1 }),
    colleges.createIndex({ state: 1 }),
    colleges.createIndex({ city: 1 }),
    comparisons.createIndex({ id: 1 }, { unique: true }),
    comparisons.createIndex({ user_id: 1, created_at: -1 }),
    questions.createIndex({ id: 1 }, { unique: true }),
    questions.createIndex({ author_id: 1 }),
    questions.createIndex({ title: 'text', content: 'text' }),
  ]);
}

export async function connectDatabase() {
  if (database) {
    return database;
  }

  if (!connectPromise) {
    client = new MongoClient(mongoUri);
    connectPromise = client
      .connect()
      .then((connectedClient) => {
        database = connectedClient.db(databaseName);
        return database;
      })
      .then(async (connectedDatabase) => {
        await ensureIndexes(connectedDatabase);
        return connectedDatabase;
      })
      .catch((error) => {
        connectPromise = null;
        throw error;
      });
  }

  return connectPromise;
}

export function getDatabase() {
  if (!database) {
    throw new Error('MongoDB database has not been initialized');
  }

  return database;
}

export function getCollections() {
  return createCollections(getDatabase());
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
  if (client) {
    await client.close();
  }

  client = null;
  database = null;
  connectPromise = null;
}
