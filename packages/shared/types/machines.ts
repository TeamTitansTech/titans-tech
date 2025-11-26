/**
 * Shared Machine Types
 * Used by both frontend and backend
 *
 * TODO: This file should be refactored to re-export types from Prisma instead of
 * manually defining interfaces. This would ensure single source of truth and prevent
 * schema drift. Current issues:
 * - branchId field is missing (exists in Prisma schema)
 * - Some fields like imageUrl, client, location don't exist in Prisma schema
 * - inspections[] doesn't exist (should use services[] which already exists)
 *
 * Proper approach: Re-export types from @titans-tech/db and create helper types
 * for common includes (e.g., MachineWithBlueprint, MachineWithRelations)
 *
 * Related files that need migration:
 * - apps/dashboard/src/data/services/machines.api.ts
 * - apps/dashboard/src/data/types/machines.types.ts
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

// Alert Clutch (for clutch service alerts)
export interface AlertClutch {
  id: string;
  machineServiceId: string;
  hydClutchClearanceTotal_value: number;
  hydClutchClearanceTotal_severity: AlertSeverity;
  hydClutchClearanceRear_value: number;
  hydClutchClearanceRear_severity: AlertSeverity;
  fb_value: number;
  fb_severity: AlertSeverity;
  fTB_value: number;
  fTB_severity: AlertSeverity;
  rTB_value: number;
  rTB_severity: AlertSeverity;
  createdAt: string;
  updatedAt: string;
}

// Alert Slide (for slide service alerts)
export interface AlertSlide {
  id: string;
  machineServiceId: string;
  maxDeviationOuter_differential: number;
  maxDeviationOuter_severity: AlertSeverity;
  maxDeviationInner_differential: number;
  maxDeviationInner_severity: AlertSeverity;
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
  alertClutch?: AlertClutch;
  alertSlide?: AlertSlide;
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
