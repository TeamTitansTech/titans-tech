/* eslint-disable no-restricted-syntax */
import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().positive(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.url(),
});

export const validateEnv = () => EnvSchema.safeParse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
