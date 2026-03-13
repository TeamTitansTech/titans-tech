import { responseHandler } from '@/data/helpers/responseHandler';
import type { Field, Blueprint as BlueprintBase } from '@/app/admin/blueprints/components/types';
import { BearingClearanceThresholdsData } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholdsData } from '@/components/alerts/ClutchThresholds';
import { ClutchCevolaniThresholdsData } from '@/components/alerts/ClutchCevolaniThresholds';
import { SlideThresholdsData } from '@/components/alerts/SlideThresholds';
import { GibsThresholdsData } from '@/components/alerts/GibsThresholds';
import { PistonsThresholdsData } from '@/components/alerts/PistonsThresholds';
import { TrammingThresholdsData } from '@/components/alerts/TrammingThresholds';

export interface CreateBlueprintPayload {
  name: string;
  imageUrl?: string;
  sections: string[];
  fields: Field[];
  thresholds?: BearingClearanceThresholdsData;
  bearingClearanceSingleHammerThresholds?: BearingClearanceThresholdsData;
  clutchThresholds?: ClutchThresholdsData;
  clutchCevolaniThresholds?: ClutchCevolaniThresholdsData;
  slideSingleHammerThresholds?: SlideThresholdsData;
  slideDoubleHammerThresholds?: SlideThresholdsData;
  gibsThresholds?: GibsThresholdsData;
  pistonsThresholds?: PistonsThresholdsData;
  trammingThresholds?: TrammingThresholdsData;
}

export interface UpdateBlueprintPayload {
  name?: string;
  imageUrl?: string;
  sections?: string[];
  fields?: Field[];
  thresholds?: BearingClearanceThresholdsData;
  bearingClearanceSingleHammerThresholds?: BearingClearanceThresholdsData;
  clutchThresholds?: ClutchThresholdsData;
  clutchCevolaniThresholds?: ClutchCevolaniThresholdsData;
  slideSingleHammerThresholds?: SlideThresholdsData;
  slideDoubleHammerThresholds?: SlideThresholdsData;
  gibsThresholds?: GibsThresholdsData;
  pistonsThresholds?: PistonsThresholdsData;
  trammingThresholds?: TrammingThresholdsData;
}

export interface Blueprint extends BlueprintBase {
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

export const getBlueprintById = async (id: string) => {
  return await responseHandler<Blueprint>(`/blueprints/${id}`);
};

export const updateBlueprint = async (id: string, payload: UpdateBlueprintPayload) => {
  return await responseHandler<Blueprint>(`/blueprints/${id}`, {
    method: 'PATCH',
    body: payload,
  });
};

export interface DeleteBlueprintErrorData {
  message: string;
  machines: { id: string; name: string }[];
  machineCount: number;
}

export const deleteBlueprint = async (id: string, cascade: boolean = false) => {
  const url = cascade ? `/blueprints/${id}?cascade=true` : `/blueprints/${id}`;
  return await responseHandler<Blueprint>(url, {
    method: 'DELETE',
  });
};
