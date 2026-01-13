import { z } from 'zod';

// Column configuration schema - defines custom columns for a subsection
export const ColumnConfigSchema = z.object({
  key: z.string().min(1, 'Column key is required'),
  label: z.string().min(1, 'Column label is required'),
  type: z.enum(['text', 'number']).default('text'),
  required: z.boolean().default(false),
});

export type ColumnConfigDto = z.infer<typeof ColumnConfigSchema>;

// Part item schema - used for creating/updating parts within a subsection
export const MachinePartItemSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.string().min(1, 'Quantity is required'), // String to support "AR" (As Required)
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.string()).optional(), // { "key": "value", ... }
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
  columnConfig: z.array(ColumnConfigSchema).optional(), // Custom column definitions
  parts: z.array(MachinePartItemSchema).optional(),
});

export type CreateSubsectionDto = z.infer<typeof CreateSubsectionSchema>;

// Update subsection schema
export const UpdateSubsectionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  figureReference: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().optional(),
  columnConfig: z.array(ColumnConfigSchema).nullable().optional(), // Custom column definitions
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
  columnConfig: ColumnConfigDto[] | null; // Custom column definitions
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
  customFields: Record<string, string> | null; // Custom field values
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
