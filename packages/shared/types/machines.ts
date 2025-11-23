/**
 * Shared Machine Types
 * Used by both frontend and backend
 */

import { Blueprint } from './blueprints';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from './enums';
import type { ServiceType, BearingClearanceCheck } from './services';

// Machine Field Definition
export interface MachineField {
  fieldSlug: string;
  value: string | number;
}

// Complete Machine Entity
export interface Machine {
  id: string;
  blueprintId: string;
  name: string;
  imageUrl?: string;
  fields: MachineField[];

  // Machine specifications
  manufacturer?: string;
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  foundationType?: FoundationType;
  frameType?: FrameType;
  clutchType?: MachineClutchType;
  pneumaticSystem?: PneumaticSystemType;
  pressMounting?: PressMountingType;
  features?: MachineFeaturesType;

  createdAt: string;
  updatedAt: string;
  blueprint?: Blueprint;
  client?: string;
  location?: string;
  services?: MachineService[];
  inspections?: MachineInspection[];
}

// Basic Service Info (for machine response)
export interface MachineService {
  id: string;
  date: string;
  isMaintenance: boolean;
  performedBy: string;
}

// Machine Inspection (detailed service data for inspections)
export interface MachineInspection {
  id: string;
  date: string;
  type: ServiceType;
  performedBy: string;
  bearingClearanceChecks: BearingClearanceCheck | null;
}

// Machine Creation Payload (for API requests)
export interface CreateMachinePayload {
  blueprintId: string;
  name: string;
  fields: MachineField[];

  // Optional machine specifications
  manufacturer?: string;
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  foundationType?: FoundationType;
  frameType?: FrameType;
  clutchType?: MachineClutchType;
  pneumaticSystem?: PneumaticSystemType;
  pressMounting?: PressMountingType;
  features?: MachineFeaturesType;
}

// Machine Update Payload
export interface UpdateMachinePayload {
  blueprintId?: string;
  name?: string;
  fields?: MachineField[];

  // Optional machine specifications
  manufacturer?: string;
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  foundationType?: FoundationType;
  frameType?: FrameType;
  clutchType?: MachineClutchType;
  pneumaticSystem?: PneumaticSystemType;
  pressMounting?: PressMountingType;
  features?: MachineFeaturesType;
}
