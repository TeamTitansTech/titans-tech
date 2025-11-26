'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

interface BearingClearanceThresholds {
  totalClearance_greenMin: number;
  totalClearance_yellowMin: number;
  totalClearance_redMin: number;
  mainBearings_greenMin: number;
  mainBearings_yellowMin: number;
  mainBearings_redMin: number;
  upperConnectionBearings_greenMin: number;
  upperConnectionBearings_yellowMin: number;
  upperConnectionBearings_redMin: number;
  wristPinToMatingPart_greenMin: number;
  wristPinToMatingPart_yellowMin: number;
  wristPinToMatingPart_redMin: number;
  wristPinToBushing_greenMin: number;
  wristPinToBushing_yellowMin: number;
  wristPinToBushing_redMin: number;
  slideAdjNutToScrewSleeve_greenMin: number;
  slideAdjNutToScrewSleeve_yellowMin: number;
  slideAdjNutToScrewSleeve_redMin: number;
}

interface CreateBlueprintPayload {
  name: string;
  sections: string[];
  fields: BlueprintField[];
  thresholds?: BearingClearanceThresholds;
}

interface Blueprint {
  id: string;
  name: string;
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

export const deleteBlueprint = async (id: string) => {
  return await responseHandler<Blueprint>(`/blueprints/${id}`, {
    method: 'DELETE',
  });
};
