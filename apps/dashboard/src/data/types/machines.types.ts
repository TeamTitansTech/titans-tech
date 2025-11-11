import { ServiceType } from './services.types';

// Blueprint-related types
export interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

export interface Blueprint {
  id: string;
  name: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Machine-related types
export interface MachineField {
  fieldSlug: string;
  value: string | number;
}

export interface FieldValue {
  fieldSlug: string;
  value: string | number;
}

export interface BearingClearance {
  id: string;
  totalClearance_RH: number;
  totalClearance_LH: number;
  mainBearings_RH: number;
  mainBearings_LH: number;
  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
}

export interface BearingClearanceCheck {
  id: string;
  before: BearingClearance | null;
  after: BearingClearance | null;
}

export interface MachineInspection {
  id: string;
  date: string;
  type: ServiceType;
  performedBy: string;
  bearingClearanceChecks: BearingClearanceCheck | null;
}

export interface Machine {
  id: string;
  blueprintId: string;
  name: string;
  imageUrl?: string;
  fields: MachineField[];
  createdAt: string;
  updatedAt: string;
  blueprint?: Blueprint;
  client?: string;
  location?: string;
  inspections?: MachineInspection[];
}

// Component props types
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
