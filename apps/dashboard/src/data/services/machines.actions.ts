'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types';
import type { Machine } from './machines.api';

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
  serialNumber: string;
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

export const createMachine = async (payload: CreateMachinePayload) => {
  const result = await responseHandler<Machine>(`/company-branches/${payload.branchId}/machines`, {
    method: 'POST',
    body: payload,
  });

  if (!result.errors) {
    revalidateTag('machines', 'max');
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
    revalidateTag('machines', 'max');
    revalidatePath('/admin/machines');
  }

  return result;
};

export const deleteMachine = async (id: string) => {
  const result = await responseHandler<void>(`/machines/${id}`, {
    method: 'DELETE',
  });

  if (!result.errors) {
    revalidateTag('machines', 'max');
    revalidatePath('/admin/machines');
  }

  return result;
};
