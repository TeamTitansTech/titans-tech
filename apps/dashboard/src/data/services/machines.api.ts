'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
  type MachineInspection as SharedMachineInspection,
  type MachineService as SharedMachineService,
} from '@titans-tech/shared/types';

interface MachineField {
  fieldSlug: string;
  value: string | number;
}

interface CreateMachinePayload {
  blueprintId: string;
  branchId: string;
  name: string;
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
}

interface UpdateMachinePayload {
  blueprintId?: string;
  name?: string;
  fields?: MachineField[];
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
}

export interface Machine {
  id: string;
  blueprintId: string;
  branchId: string;
  name: string;
  imageUrl?: string;
  fields: MachineField[];
  // Machine specifications
  manufacturer?: string;
  model?: string;
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
  branch?: {
    id: string;
    name: string;
    companyId: string;
  };
  client?: string;
  location?: string;
  services?: SharedMachineService[];
  inspections?: SharedMachineInspection[];
}

interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

interface Blueprint {
  id: string;
  name: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
}

export const getBlueprints = async () => {
  return await responseHandler<Blueprint[]>('/blueprints', {
    method: 'GET',
  });
};

export const getMachines = async () => {
  return await responseHandler<Machine[]>('/machines', {
    method: 'GET',
  });
};

export const getMachinesByBranch = async (branchId: string) => {
  return await responseHandler<Machine[]>(`/company-branches/${branchId}/machines`, {
    method: 'GET',
  });
};

export const getMachineById = async (id: string) => {
  return await responseHandler<Machine>(`/machines/${id}`, {
    method: 'GET',
  });
};

export const createMachine = async (payload: CreateMachinePayload) => {
  return await responseHandler<Machine>(`/company-branches/${payload.branchId}/machines`, {
    method: 'POST',
    body: payload,
  });
};

export const updateMachine = async (id: string, payload: UpdateMachinePayload) => {
  return await responseHandler<Machine>(`/machines/${id}`, {
    method: 'PUT',
    body: payload,
  });
};

export const deleteMachine = async (id: string) => {
  return await responseHandler<void>(`/machines/${id}`, {
    method: 'DELETE',
  });
};
