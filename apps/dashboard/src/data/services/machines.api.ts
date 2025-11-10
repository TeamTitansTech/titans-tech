'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

interface MachineField {
  fieldSlug: string;
  value: string | number;
}

interface CreateMachinePayload {
  blueprintId: string;
  branchId: string;
  name: string;
  fields: MachineField[];
}

interface Machine {
  id: string;
  blueprintId: string;
  branchId: string;
  name: string;
  fields: MachineField[];
  createdAt: string;
  updatedAt: string;
  blueprint?: Blueprint;
  branch?: {
    id: string;
    name: string;
    companyId: string;
  };
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
  return await responseHandler<Machine>('/machines', {
    method: 'POST',
    body: payload,
  });
};
