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
import type { AlertSeverity } from '../enums';

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

// Alert Bearing Clearance (for service alerts)
export interface AlertBearingClearance {
  id: string;
  machineServiceId: string;
  totalClearance_RH: number;
  totalClearance_LH: number;
  totalClearance_differential: number;
  totalClearance_severity: AlertSeverity;
  mainBearings_RH: number;
  mainBearings_LH: number;
  mainBearings_differential: number;
  mainBearings_severity: AlertSeverity;
  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  upperConnectionBearings_differential: number;
  upperConnectionBearings_severity: AlertSeverity;
  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToMatingPart_differential: number;
  wristPinToMatingPart_severity: AlertSeverity;
  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
  wristPinToBushing_differential: number;
  wristPinToBushing_severity: AlertSeverity;
  slideAdjNutToScrewSleeve_RH: number;
  slideAdjNutToScrewSleeve_LH: number;
  slideAdjNutToScrewSleeve_differential: number;
  slideAdjNutToScrewSleeve_severity: AlertSeverity;
  createdAt: string;
  updatedAt: string;
}

// Basic Service Info (for machine response)
export interface MachineService {
  id: string;
  date: string;
  isMaintenance: boolean;
  performedBy: string;
  alertBearingClearance?: AlertBearingClearance;
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
