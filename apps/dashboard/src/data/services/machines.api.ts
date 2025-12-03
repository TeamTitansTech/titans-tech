'use server';
import { revalidatePath } from 'next/cache';
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

interface UpdateMachinePayload {
  blueprintId?: string;
  name?: string;
  fields?: MachineField[];
  // Machine specifications
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
  imageUrl?: string;
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
    tags: ['machines'],
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
  const result = await responseHandler<Machine>(`/company-branches/${payload.branchId}/machines`, {
    method: 'POST',
    body: payload,
  });

  if (!result.errors) {
    revalidatePath('/admin/machines');
  }

  return result;
};

export const updateMachine = async (id: string, payload: UpdateMachinePayload) => {
  const result = await responseHandler<Machine>(`/machines/${id}`, {
    method: 'PUT',
    body: payload,
  });

  if (!result.errors) {
    revalidatePath('/admin/machines');
  }

  return result;
};

export const deleteMachine = async (id: string) => {
  const result = await responseHandler<void>(`/machines/${id}`, {
    method: 'DELETE',
  });

  if (!result.errors) {
    revalidatePath('/admin/machines');
  }

  return result;
};

export interface PartItem {
  partNumber: string;
  description: string;
  quantity: number | string;
  unit: string;
}

export interface PartsGroup {
  subsectionName: string;
  parts: PartItem[];
}

export interface SendPartsEmailPayload {
  machineId: string;
  machineName: string;
  machineSerial: string;
  sectionName: string;
  emails: string[];
  partsGroups: PartsGroup[];
}

export interface SendPartsEmailResponse {
  success: boolean;
  message: string;
}

export const sendPartsEmail = async (payload: SendPartsEmailPayload) => {
  return await responseHandler<SendPartsEmailResponse>('/machines/send-parts-email', {
    method: 'POST',
    body: payload,
  });
};
