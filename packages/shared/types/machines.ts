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
  branchId: string;
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

  // OUTER alerts
  outer_totalClearance_differential: number;
  outer_totalClearance_severity: AlertSeverity;
  outer_mainBearings_differential: number;
  outer_mainBearings_severity: AlertSeverity;
  outer_upperConnectionBearings_differential: number;
  outer_upperConnectionBearings_severity: AlertSeverity;
  outer_wristPinToMatingPart_differential: number;
  outer_wristPinToMatingPart_severity: AlertSeverity;
  outer_wristPinToBushing_differential: number;
  outer_wristPinToBushing_severity: AlertSeverity;
  outer_slideAdjNutToScrewSleeve_differential: number;
  outer_slideAdjNutToScrewSleeve_severity: AlertSeverity;

  // INNER alerts
  inner_totalClearance_differential: number;
  inner_totalClearance_severity: AlertSeverity;
  inner_mainBearings_differential: number;
  inner_mainBearings_severity: AlertSeverity;
  inner_upperConnectionBearings_differential: number;
  inner_upperConnectionBearings_severity: AlertSeverity;
  inner_wristPinToMatingPart_differential: number;
  inner_wristPinToMatingPart_severity: AlertSeverity;
  inner_wristPinToBushing_differential: number;
  inner_wristPinToBushing_severity: AlertSeverity;
  inner_slideAdjNutToScrewSleeve_differential: number;
  inner_slideAdjNutToScrewSleeve_severity: AlertSeverity;

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

// Alert GIBS (for GIBS service alerts)
export interface AlertGibs {
  id: string;
  machineServiceId: string;
  usable_value: number;
  usable_severity: AlertSeverity;
  createdAt: string;
  updatedAt: string;
}

export interface AlertCounterbalance {
  id: string;
  machineServiceId: string;
  fieldName: string;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

// Basic Service Info (for machine response)
export interface MachineService {
  id: string;
  date: string;
  isMaintenance: boolean;
  performedBy: string;
  // Alerts are arrays as per Prisma schema (one-to-many relationships)
  alertBearingClearance?: AlertBearingClearance[];
  alertClutch?: AlertClutch[];
  alertSlide?: AlertSlide[];
  alertGibs?: AlertGibs[];
  alertCounterbalanceCylinderAirbag?: AlertCounterbalance[];
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
  imageUrl?: string;
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
  imageUrl?: string;
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
