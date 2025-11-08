import { InspectionSection } from '../../generated/prisma/client';

export const INSPECTION_SECTION_CONFIG = {
  [InspectionSection.BEARING_CLEARANCE]: {
    slug: 'bearing_clearance',
    displayName: 'Bearing Clearance',
  },
  [InspectionSection.SLIDE]: {
    slug: 'slide',
    displayName: 'Slide',
  },
  [InspectionSection.GIBS]: {
    slug: 'gibs',
    displayName: 'Gibs',
  },
  [InspectionSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER]: {
    slug: 'lubrication_hydraulics_pressure_switches_oil_filter',
    displayName: 'Lubrication / Hydraulics / Pressure Switches / Oil & Filter',
  },
  [InspectionSection.CLUTCH]: {
    slug: 'clutch',
    displayName: 'Clutch',
  },
  [InspectionSection.COUNTERBALANCE_CYLINDER_AIRBAG]: {
    slug: 'counterbalance_cylinder_airbag',
    displayName: 'Counterbalance Cylinder / Airbag',
  },
} as const;

export const INSPECTION_SECTIONS = Object.values(InspectionSection);

export const INSPECTION_SECTION_SLUGS = Object.values(INSPECTION_SECTION_CONFIG).map(
  (config) => config.slug,
);

// Helper function to get enum value from slug
export function getInspectionSectionFromSlug(slug: string): InspectionSection | undefined {
  const entry = Object.entries(INSPECTION_SECTION_CONFIG).find(
    ([, config]) => config.slug === slug,
  );
  return entry ? (entry[0] as InspectionSection) : undefined;
}

// Helper function to get slug from enum value
export function getSlugFromInspectionSection(section: InspectionSection): string {
  return INSPECTION_SECTION_CONFIG[section].slug;
}

// Helper function to get display name from slug
export function getDisplayNameFromSlug(slug: string): string | undefined {
  const entry = Object.values(INSPECTION_SECTION_CONFIG).find((config) => config.slug === slug);
  return entry?.displayName;
}
