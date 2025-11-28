/**
 * Machine DTOs with Validation Schemas
 * Centralized DTOs for all machine-related operations
 */

import { z } from 'zod';
import {
  FoundationType as FoundationTypeEnum,
  FrameType as FrameTypeEnum,
  MachineClutchType as MachineClutchTypeEnum,
  PneumaticSystemType as PneumaticSystemTypeEnum,
  PressMountingType as PressMountingTypeEnum,
  MachineFeaturesType as MachineFeaturesTypeEnum,
} from '../../types/enums';

// Create Zod enums from the TypeScript enums
const FoundationType = z.nativeEnum(FoundationTypeEnum);
const FrameType = z.nativeEnum(FrameTypeEnum);
const MachineClutchType = z.nativeEnum(MachineClutchTypeEnum);
const PneumaticSystemType = z.nativeEnum(PneumaticSystemTypeEnum);
const PressMountingType = z.nativeEnum(PressMountingTypeEnum);
const MachineFeaturesType = z.nativeEnum(MachineFeaturesTypeEnum);

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Machine Field DTO Schema
 */
export const MachineFieldSchema = z.object({
  fieldSlug: z.string().min(1, 'Field slug is required'),
  value: z.string().min(1, 'Field value is required'),
});

export type MachineFieldDto = z.infer<typeof MachineFieldSchema>;

// ============================================================================
// Create Machine DTOs
// ============================================================================

/**
 * Create Machine DTO Schema
 */
export const CreateMachineSchema = z.object({
  blueprintId: z.string().min(1, 'Blueprint ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  name: z.string().min(1, 'Machine name is required'),
  fields: z.array(MachineFieldSchema).min(1, 'At least one field is required'),

  // Optional machine specifications
  imageUrl: z.string().optional(),
  manufacturer: z.string().optional(),
  sizeTonnage: z.string().optional(),
  serialNumber: z.string().optional(),
  stroke: z.string().optional(),
  foundationType: FoundationType.optional(),
  frameType: FrameType.optional(),
  clutchType: MachineClutchType.optional(),
  pneumaticSystem: PneumaticSystemType.optional(),
  pressMounting: PressMountingType.optional(),
  features: MachineFeaturesType.optional(),
});

export type CreateMachineDto = z.infer<typeof CreateMachineSchema>;

// ============================================================================
// Update Machine DTOs
// ============================================================================

/**
 * Update Machine DTO Schema
 */
export const UpdateMachineSchema = z.object({
  blueprintId: z.string().optional(),
  name: z.string().optional(),
  fields: z.array(MachineFieldSchema).optional(),

  // Optional machine specifications
  imageUrl: z.string().optional(),
  manufacturer: z.string().optional(),
  sizeTonnage: z.string().optional(),
  serialNumber: z.string().optional(),
  stroke: z.string().optional(),
  foundationType: FoundationType.optional(),
  frameType: FrameType.optional(),
  clutchType: MachineClutchType.optional(),
  pneumaticSystem: PneumaticSystemType.optional(),
  pressMounting: PressMountingType.optional(),
  features: MachineFeaturesType.optional(),
});

export type UpdateMachineDto = z.infer<typeof UpdateMachineSchema>;
