import { z } from 'zod';

// Part item schema - used for creating/updating parts within a subsection
export const MachinePartItemSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.string().min(1, 'Quantity is required'), // String to support "AR" (As Required)
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().optional(),
  notes: z.string().optional(),
  displayOrder: z.number().optional(),
});

export type MachinePartItemDto = z.infer<typeof MachinePartItemSchema>;

// Create subsection schema
export const CreateSubsectionSchema = z.object({
  subsectionId: z.string().min(1, 'Subsection ID is required'),
  name: z.string().min(1, 'Name is required'),
  figureReference: z.string().optional(),
  description: z.string().optional(),
  diagramImageUrl: z.string().optional(), // URL to default diagram image (for copying from defaults)
  displayOrder: z.number().optional(),
  parts: z.array(MachinePartItemSchema).optional(),
});

export type CreateSubsectionDto = z.infer<typeof CreateSubsectionSchema>;

// Update subsection schema
export const UpdateSubsectionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  figureReference: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
});

export type UpdateSubsectionDto = z.infer<typeof UpdateSubsectionSchema>;

// Update parts schema - replace all parts in a subsection
export const UpdateSubsectionPartsSchema = z.object({
  parts: z.array(MachinePartItemSchema),
});

export type UpdateSubsectionPartsDto = z.infer<typeof UpdateSubsectionPartsSchema>;

// Initialize parts config schema
export const InitializePartsConfigSchema = z.object({
  sectionKey: z.string().min(1, 'Section key is required'),
  copyFromDefaults: z.boolean().default(true),
});

export type InitializePartsConfigDto = z.infer<typeof InitializePartsConfigSchema>;

// Response types for parts configuration
export interface SubsectionResponseDto {
  id: string;
  configId: string;
  sectionKey: string;
  subsectionId: string;
  name: string;
  figureReference: string | null;
  description: string | null;
  diagramImageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  parts: PartItemResponseDto[];
}

export interface PartItemResponseDto {
  id: string;
  subsectionId: string;
  partNumber: string;
  description: string;
  quantity: string;
  unit: string;
  location: string | null;
  notes: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartsConfigResponseDto {
  hasCustomConfig: boolean;
  config: {
    id: string;
    machineId: string;
    createdAt: string;
    updatedAt: string;
    subsections: SubsectionResponseDto[];
  } | null;
}

export interface SectionPartsResponseDto {
  hasCustomConfig: boolean;
  sectionKey: string;
  subsections: SubsectionResponseDto[];
}
