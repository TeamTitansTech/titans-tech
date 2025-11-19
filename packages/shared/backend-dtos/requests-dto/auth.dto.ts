import { z } from 'zod';

/**
 * Login Request DTO
 * Used for all login endpoints (admin, company, user)
 */
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

/**
 * Login Response DTO
 * Standard response for successful login
 */
export interface LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
    companyId?: string;
    companyBranchId?: string;
  };
}

/**
 * JWT Payload
 * Structure of the JWT token payload
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role?: string;
  companyId?: string;
  companyBranchId?: string;
  iat?: number;
  exp?: number;
}
