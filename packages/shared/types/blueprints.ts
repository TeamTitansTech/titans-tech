/**
 * Shared Blueprint Types (Interfaces only - NO DTOs)
 * Used by both frontend and backend
 * DTOs are located in backend-dtos/requests-dto/blueprint.dto.ts
 */

// Enums
export enum ServiceSection {
  BEARING_CLEARANCE = 'BEARING_CLEARANCE',
  BEARING_CLEARANCE_SINGLE_HAMMER = 'BEARING_CLEARANCE_SINGLE_HAMMER',
  SLIDE_SINGLE_HAMMER = 'SLIDE_SINGLE_HAMMER',
  SLIDE_DOUBLE_HAMMER = 'SLIDE_DOUBLE_HAMMER',
  GIBS = 'GIBS',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER = 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  CLUTCH = 'CLUTCH',
  CLUTCH_CEVOLANI = 'CLUTCH_CEVOLANI',
  COUNTERBALANCE_CYLINDER_AIRBAG = 'COUNTERBALANCE_CYLINDER_AIRBAG',
  TRAMMING = 'TRAMMING',
  PISTONS = 'PISTONS',
  SHIM_THICKNESS = 'SHIM_THICKNESS',
  DIE_CUSHION = 'DIE_CUSHION',
  ELECTRICAL_CONTROL = 'ELECTRICAL_CONTROL',
  PERPENDICULARITY = 'PERPENDICULARITY',
  ANGULARITY = 'ANGULARITY',
}

// Blueprint Field Definition (Interface - not DTO)
export interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

// Complete Blueprint Entity (Interface - not DTO)
export interface Blueprint {
  id: string;
  name: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Blueprint Payload Interfaces for frontend usage
export interface CreateBlueprintPayload {
  name: string;
  fields: BlueprintField[];
  sections: ServiceSection[];
}

export interface UpdateBlueprintPayload {
  name?: string;
  fields?: BlueprintField[];
  sections?: ServiceSection[];
}
