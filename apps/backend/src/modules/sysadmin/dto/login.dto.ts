import { PasswordSchema } from '@titans-tech/shared';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email(),
  password: PasswordSchema,
});

export type LoginDto = z.infer<typeof LoginSchema>;
