import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection during backend startup:');
  console.error(error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception during backend startup:');
  console.error(error);
  process.exit(1);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distServerPath = resolve(__dirname, 'dist/server.js');

if (!existsSync(distServerPath)) {
  console.log('Building backend before start...');
  execSync('npm run build', {
    stdio: 'inherit',
    cwd: __dirname,
  });
}

try {
  await import('./dist/server.js');
} catch (error) {
  console.error('Failed to load compiled backend server:');
  console.error(error);
  process.exit(1);
}