/**
 * Client-safe inspection section constants
 * This file does NOT import from Prisma and can be safely used in client components
 */

export const INSPECTION_SECTION_SLUGS = [
  'bearing_clearance',
  'slide',
  'gibs',
  'lubrication_hydraulics_pressure_switches_oil_filter',
  'clutch',
  'counterbalance_cylinder_airbag',
] as const;

export type InspectionSectionSlug = (typeof INSPECTION_SECTION_SLUGS)[number];
