/**
 * Shared Blueprint Types
 * Used by both frontend and backend
 */

// Enums
export enum ServiceSection {
  BEARING_CLEARANCE = 'BEARING_CLEARANCE',
  SLIDE = 'SLIDE',
  GIBS = 'GIBS',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER = 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  CLUTCH = 'CLUTCH',
  COUNTERBALANCE_CYLINDER_AIRBAG = 'COUNTERBALANCE_CYLINDER_AIRBAG',
  TRAMMING = 'TRAMMING',
}

// Blueprint Field Definition
export interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

// Complete Blueprint Entity
export interface Blueprint {
  id: string;
  name: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Blueprint Creation Payload (for API requests)
export interface CreateBlueprintPayload {
  name: string;
  fields: BlueprintField[];
  sections: ServiceSection[];
}

// Blueprint Update Payload
export interface UpdateBlueprintPayload {
  name?: string;
  fields?: BlueprintField[];
  sections?: ServiceSection[];
}
