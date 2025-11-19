/**
 * Machine Types
 * Re-exports from shared package for type consistency
 */

// Re-export all machine types from shared package
export type {
  Machine,
  MachineField,
  MachineService,
  MachineInspection,
  CreateMachinePayload,
  UpdateMachinePayload,
} from '@titans-tech/shared/types';

// Re-export Blueprint types from shared package
export type { Blueprint, BlueprintField } from '@titans-tech/shared/types';

// Legacy type alias for backward compatibility
export type FieldValue = {
  fieldSlug: string;
  value: string | number;
};

// Component props types
import type { Machine } from '@titans-tech/shared/types';
export interface MachineDetailsProps {
  machine: Machine;
}

export interface MachineCardProps {
  id: string;
  name: string;
  blueprintName: string;
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
}
