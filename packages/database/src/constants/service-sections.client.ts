/**
 * Client-safe service section constants
 * This file does NOT import from Prisma and can be safely used in client components
 */

export const SERVICE_SECTION_SLUGS = [
  'bearing_clearance',
  'bearing_clearance_single_hammer',
  'slide_single_hammer',
  'slide_double_hammer',
  'gibs',
  'lubrication_hydraulics_pressure_switches_oil_filter',
  'clutch',
  'clutch_cevolani',
  'counterbalance_cylinder_airbag',
  'tramming',
  'pistons',
  'shim_thickness',
  'die_cushion',
  'electrical_control',
  'perpendicularity',
] as const;

// Angularity is a special section that is enabled via a checkbox, not selected from the list
export const ANGULARITY_SECTION_SLUG = 'angularity' as const;

export type ServiceSectionSlug = (typeof SERVICE_SECTION_SLUGS)[number];
