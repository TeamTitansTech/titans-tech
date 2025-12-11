import { defineConfig, env } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// Load from backend first (local dev), then root (CI fallback)
// dotenv doesn't override existing values, so first loaded wins
dotenv.config({ path: path.resolve(__dirname, '../../apps/backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
