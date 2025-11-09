import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().positive(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().min(1),
  AUTH_JWT_SECRET: z.string().min(1),
});

// eslint-disable-next-line no-restricted-syntax
export const appEnv = EnvSchema.parse(process.env);
