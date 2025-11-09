import { z } from 'zod';

export const CreateCompanySchema = z.object({
  name: z.string().min(1),
  //   slug: z.string().min(1),
  logo: z.string().optional(),
  brandColor: z.string().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;

export const UpdateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().optional(),
  brandColor: z.string().optional(),
});

export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;
