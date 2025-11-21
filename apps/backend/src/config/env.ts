import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().positive(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().min(1),
  AUTH_JWT_SECRET: z.string().min(1),
  // Email configuration
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@titanstech.com'),
  EMAIL_PROVIDER: z.enum(['SENDGRID', 'AWS_SES']).default('SENDGRID'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

// eslint-disable-next-line no-restricted-syntax
export const appEnv = EnvSchema.parse(process.env);
