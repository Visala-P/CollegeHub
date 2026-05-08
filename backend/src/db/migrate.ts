import { connectDatabase } from './config.js';
import { seedDataIfEmpty } from './seed.js';

async function migrate() {
  await connectDatabase();
  await seedDataIfEmpty();
  console.log('✅ MongoDB connection and seed initialization completed successfully');
}

migrate()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup database:', error);
    process.exit(1);
  });
