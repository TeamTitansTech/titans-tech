/**
 * Shared Machine Types
 * Used by both frontend and backend
 */

import { Blueprint } from './blueprints';

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
  createdAt: string;
  updatedAt: string;
  blueprint?: Blueprint;
  client?: string;
  location?: string;
  services?: MachineService[];
}

// Basic Service Info (for machine response)
export interface MachineService {
  id: string;
  date: string;
  isMaintenance: boolean;
  performedBy: string;
}

// Machine Creation Payload (for API requests)
export interface CreateMachinePayload {
  blueprintId: string;
  name: string;
  fields: MachineField[];
}

// Machine Update Payload
export interface UpdateMachinePayload {
  blueprintId?: string;
  name?: string;
  fields?: MachineField[];
}
