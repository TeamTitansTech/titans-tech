import { z } from 'zod';

export const CreateCompanySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().optional(),
  loginLogo: z.string().optional(),
  brandColor: z.string().optional(),
  accentColor: z.string().optional(),
  description: z.string().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;

export const UpdateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  logo: z.string().optional(),
  loginLogo: z.string().optional(),
  brandColor: z.string().optional(),
  accentColor: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
