import { z } from 'zod';

export const CreateCompanyBranchSchema = z.object({
  name: z.string().min(1),
});

export type CreateCompanyBranchDto = z.infer<typeof CreateCompanyBranchSchema>;

export const UpdateCompanyBranchSchema = z.object({
  name: z.string().min(1).optional(),
});

export type UpdateCompanyBranchDto = z.infer<typeof UpdateCompanyBranchSchema>;
