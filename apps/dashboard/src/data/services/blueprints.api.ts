'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

interface CreateBlueprintPayload {
  name: string;
  imageUrl?: string;
  sections: string[];
  fields: BlueprintField[];
}

interface UpdateBlueprintPayload {
  name?: string;
  imageUrl?: string;
  sections?: string[];
  fields?: BlueprintField[];
}

interface Blueprint {
  id: string;
  name: string;
  imageUrl?: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    machines: number;
  };
}

export const createBlueprint = async (payload: CreateBlueprintPayload) => {
  return await responseHandler<Blueprint>('/blueprints', {
    method: 'POST',
    body: payload,
  });
};

export const getBlueprints = async () => {
  return await responseHandler<Blueprint[]>('/blueprints');
};

export const updateBlueprint = async (
  id: string,
  payload: UpdateBlueprintPayload,
) => {
  return await responseHandler<Blueprint>(`/blueprints/${id}`, {
    method: 'PATCH',
    body: payload,
  });
};
