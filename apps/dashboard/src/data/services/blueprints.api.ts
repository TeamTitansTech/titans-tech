'use server';
import { responseHandler } from '@/data/helpers/responseHandler';

export interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

export interface BearingClearanceThresholds {
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

export interface ClutchThresholds {
  hydClutchClearanceTotal_greenMin: number;
  hydClutchClearanceTotal_yellowMin: number;
  hydClutchClearanceTotal_redMin: number;
  hydClutchClearanceRear_greenMin: number;
  hydClutchClearanceRear_yellowMin: number;
  hydClutchClearanceRear_redMin: number;
  fb_greenMin: number;
  fb_yellowMin: number;
  fb_redMin: number;
  fTB_greenMin: number;
  fTB_yellowMin: number;
  fTB_redMin: number;
  rTB_greenMin: number;
  rTB_yellowMin: number;
  rTB_redMin: number;
}

export interface SlideThresholds {
  maxDeviation_greenMin: number;
  maxDeviation_yellowMin: number;
  maxDeviation_redMin: number;
}

export interface GibsThresholds {
  usable_greenMin: number;
  usable_yellowMin: number;
  usable_redMin: number;
}

export interface CreateBlueprintPayload {
  name: string;
  imageUrl?: string;
  sections: string[];
  fields: BlueprintField[];
  thresholds?: BearingClearanceThresholds;
  clutchThresholds?: ClutchThresholds;
  slideThresholds?: SlideThresholds;
  gibsThresholds?: GibsThresholds;
}

export interface UpdateBlueprintPayload {
  name?: string;
  imageUrl?: string;
  sections?: string[];
  fields?: BlueprintField[];
  thresholds?: BearingClearanceThresholds;
  clutchThresholds?: ClutchThresholds;
  slideThresholds?: SlideThresholds;
  gibsThresholds?: GibsThresholds;
}

export interface Blueprint {
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

export const getBlueprint = async (id: string) => {
  return await responseHandler<
    Blueprint & {
      thresholdBearingClearance?: BearingClearanceThresholds;
      thresholdClutch?: ClutchThresholds;
      thresholdSlide?: SlideThresholds;
      thresholdGibs?: GibsThresholds;
    }
  >(`/blueprints/${id}`);
};

export const updateBlueprint = async (id: string, payload: UpdateBlueprintPayload) => {
  return await responseHandler<Blueprint>(`/blueprints/${id}`, {
    method: 'PATCH',
    body: payload,
  });
};

export const deleteBlueprint = async (id: string) => {
  return await responseHandler<Blueprint>(`/blueprints/${id}`, {
    method: 'DELETE',
  });
};
