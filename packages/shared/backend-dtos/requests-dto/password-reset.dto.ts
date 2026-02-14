import { z } from 'zod';
import { PasswordSchema } from './password.dto';

export const ForgotPasswordSchema = z.object({
  email: z.email('Invalid email format'),
  companyId: z.string().optional(), // null/undefined = sysadmin
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const SetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SetPasswordDto = z.infer<typeof SetPasswordSchema>;

export const ValidateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type ValidateTokenDto = z.infer<typeof ValidateTokenSchema>;
