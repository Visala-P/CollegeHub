import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://[::1]:5173'];
const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...localOrigins, ...configuredOrigins]);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
};

const corsOptionsDelegate = (
  req: Request,
  callback: (err: Error | null, options?: { origin?: boolean; credentials?: boolean }) => void
) => {
  const origin = req.header('Origin');
  if (isAllowedOrigin(origin ?? undefined)) {
    callback(null, { origin: true, credentials: true });
  } else {
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }
};

app.use(cors(corsOptionsDelegate as any));
app.options('*', cors(corsOptionsDelegate as any));

app.use((req: Request, res: Response, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const collegesRouter = (await import('./routes/colleges.js')).default;
const authRouter = (await import('./routes/auth.js')).default;
const compareRouter = (await import('./routes/compare.js')).default;
const qaRouter = (await import('./routes/qa.js')).default;
const predictorRouter = (await import('./routes/predictor.js')).default;

app.use('/api/colleges', collegesRouter);
app.use('/api/auth', authRouter);
app.use('/api/compare', compareRouter);
app.use('/api/qa', qaRouter);
app.use('/api/predictor', predictorRouter);

app.get(['/api', '/api/'], (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'College Discovery Platform API is running',
    colleges: 'Available',
    auth: 'Available'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'College Discovery Platform API is running' });
});

app.use((req: Request, res: Response) => {
  console.log(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`========================================`);
  console.log(`📚 API Endpoints:`);
  console.log(`   - GET    /api/colleges`);
  console.log(`   - GET    /api/colleges/:id`);
  console.log(`   - GET    /api/colleges/search`);
  console.log(`   - GET    /api/colleges/filters`);
  console.log(`   - POST   /api/predictor/predict`);
  console.log(`   - GET    /api/health`);
  console.log(`========================================\n`);
});

export default app;