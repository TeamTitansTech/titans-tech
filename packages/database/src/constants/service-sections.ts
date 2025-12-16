import { ServiceSection } from '../../generated/prisma/client';

export const SERVICE_SECTION_CONFIG = {
  [ServiceSection.BEARING_CLEARANCE]: {
    slug: 'bearing_clearance',
    displayName: 'Bearing Clearance',
  },
  [ServiceSection.BEARING_CLEARANCE_SINGLE_HAMMER]: {
    slug: 'bearing_clearance_single_hammer',
    displayName: 'Bearing Clearance (Single Hammer)',
  },
  [ServiceSection.SLIDE]: {
    slug: 'slide',
    displayName: 'Slide (Legacy)',
  },
  [ServiceSection.SLIDE_SINGLE_HAMMER]: {
    slug: 'slide_single_hammer',
    displayName: 'Slide (Single Hammer)',
  },
  [ServiceSection.SLIDE_DOUBLE_HAMMER]: {
    slug: 'slide_double_hammer',
    displayName: 'Slide (Double Hammer)',
  },
  [ServiceSection.GIBS]: {
    slug: 'gibs',
    displayName: 'Gibs',
  },
  [ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER]: {
    slug: 'lubrication_hydraulics_pressure_switches_oil_filter',
    displayName: 'Lubrication / Hydraulics / Pressure Switches / Oil & Filter',
  },
  [ServiceSection.CLUTCH]: {
    slug: 'clutch',
    displayName: 'Clutch',
  },
  [ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG]: {
    slug: 'counterbalance_cylinder_airbag',
    displayName: 'Counterbalance Cylinder / Airbag',
  },
  [ServiceSection.TRAMMING]: {
    slug: 'tramming',
    displayName: 'Tramming',
  },
  [ServiceSection.PISTONS]: {
    slug: 'pistons',
    displayName: 'Pistons',
  },
  [ServiceSection.SHIM_THICKNESS]: {
    slug: 'shim_thickness',
    displayName: 'Shim Thickness',
  },
  [ServiceSection.DIE_CUSHION]: {
    slug: 'die_cushion',
    displayName: 'Die Cushion',
  },
  [ServiceSection.ELECTRICAL_CONTROL]: {
    slug: 'electrical_control',
    displayName: 'Electrical Control',
  },
  [ServiceSection.PERPENDICULARITY]: {
    slug: 'perpendicularity',
    displayName: 'Perpendicularity',
  },
} as const;

export const SERVICE_SECTIONS = Object.values(ServiceSection);

// SERVICE_SECTION_SLUGS is now exported from service-sections.client.ts
// to avoid Prisma client dependencies in client-side code

export function getServiceSectionFromSlug(slug: string): ServiceSection | undefined {
  const entry = Object.entries(SERVICE_SECTION_CONFIG).find(([, config]) => config.slug === slug);
  return entry ? (entry[0] as ServiceSection) : undefined;
}

export function getSlugFromServiceSection(section: ServiceSection): string {
  return SERVICE_SECTION_CONFIG[section].slug;
}

export function getDisplayNameFromSlug(slug: string): string | undefined {
  const entry = Object.values(SERVICE_SECTION_CONFIG).find((config) => config.slug === slug);
  return entry?.displayName;
}
