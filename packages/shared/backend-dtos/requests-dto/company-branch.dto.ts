import { z } from 'zod';

export const MeasurementUnitEnum = z.enum(['INCHES', 'MM']);

export const CreateCompanyBranchSchema = z.object({
  name: z.string().min(1),
  isMainBranch: z.boolean().optional(),
  location: z.string().optional(),
  defaultMeasurementUnit: MeasurementUnitEnum.optional(),
});

export type CreateCompanyBranchDto = z.infer<typeof CreateCompanyBranchSchema>;

export const UpdateCompanyBranchSchema = z.object({
  name: z.string().min(1).optional(),
  isMainBranch: z.boolean().optional(),
  location: z.string().optional(),
  defaultMeasurementUnit: MeasurementUnitEnum.optional(),
});

export type UpdateCompanyBranchDto = z.infer<typeof UpdateCompanyBranchSchema>;
