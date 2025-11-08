// Client-side constants for inspection sections
// These should match the InspectionSection enum in the database

export const INSPECTION_SECTION_SLUGS = [
  'bearing_clearance',
  'slide',
  'gibs',
  'lubrication_hydraulics_pressure_switches_oil_filter',
  'clutch',
  'counterbalance_cylinder_airbag',
] as const;

export type InspectionSectionSlug = (typeof INSPECTION_SECTION_SLUGS)[number];
