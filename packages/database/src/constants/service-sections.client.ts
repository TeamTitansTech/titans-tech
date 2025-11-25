/**
 * Client-safe service section constants
 * This file does NOT import from Prisma and can be safely used in client components
 */

export const SERVICE_SECTION_SLUGS = [
  'bearing_clearance',
  'slide',
  'gibs',
  'lubrication_hydraulics_pressure_switches_oil_filter',
  'clutch',
  'counterbalance_cylinder_airbag',
  'tramming',
  'pistons',
] as const;

export type ServiceSectionSlug = (typeof SERVICE_SECTION_SLUGS)[number];
