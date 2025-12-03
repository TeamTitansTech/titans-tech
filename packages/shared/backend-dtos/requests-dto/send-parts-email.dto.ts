import { z } from 'zod';

export const PartItemSchema = z.object({
  partNumber: z.string(),
  description: z.string(),
  quantity: z.union([z.number(), z.string()]).default(1),
  unit: z.string(),
});

export const PartsGroupSchema = z.object({
  subsectionName: z.string(),
  parts: z.array(PartItemSchema),
});

export const SendPartsEmailDtoSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  machineName: z.string().min(1, 'Machine name is required'),
  machineSerial: z.string().min(1, 'Machine serial is required'),
  sectionName: z.string().min(1, 'Section name is required'),
  emails: z
    .array(z.string().email('Invalid email format'))
    .min(1, 'At least one email is required'),
  partsGroups: z.array(PartsGroupSchema).min(1, 'At least one parts group is required'),
});

export type PartItem = z.infer<typeof PartItemSchema>;
export type PartsGroup = z.infer<typeof PartsGroupSchema>;
export type SendPartsEmailDto = z.infer<typeof SendPartsEmailDtoSchema>;
