import { z } from 'zod';

// Schema for updating company contract limits (SysAdmin only)
export const UpdateCompanyLimitsSchema = z.object({
  contractMaxBranches: z.number().int().min(1).optional(),
  contractMaxUsers: z.number().int().min(1).optional(),
  contractMaxMachines: z.number().int().min(1).optional(),
  contractMaxProductionLines: z.number().int().min(1).optional(),
});

export type UpdateCompanyLimitsDto = z.infer<typeof UpdateCompanyLimitsSchema>;

// Response for company usage statistics
export interface CompanyUsageResponseDto {
  companyId: string;
  companyName: string;
  usage: {
    branches: { current: number; max: number };
    users: { current: number; max: number };
    machines: { current: number; max: number };
    productionLines: { current: number; max: number };
  };
}
