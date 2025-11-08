'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

interface MachineField {
  fieldSlug: string;
  value: string | number;
}

interface CreateMachinePayload {
  blueprintId: string;
  name: string;
  fields: MachineField[];
}

interface Machine {
  id: string;
  blueprintId: string;
  name: string;
  fields: MachineField[];
  createdAt: string;
  updatedAt: string;
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

export const createMachine = async (payload: CreateMachinePayload) => {
  return await responseHandler<Machine>('/machines', {
    method: 'POST',
    body: payload,
  });
};
