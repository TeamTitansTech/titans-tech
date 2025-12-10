import type { ComponentType } from 'react';
import { BearingClearanceSection } from './BearingClearanceSection';
import { SlideSingleHammerSection } from './SlideSingleHammerSection';
import { SlideDoubleHammerSection } from './SlideDoubleHammerSection';
import { GibsSection } from './';
import { LubricationHydraulicsSection } from './LubricationHydraulicsSection';
import { ClutchSection } from './ClutchSection';
import { CounterbalanceCylinderSection } from './CounterbalanceCylinderSection';
import { TrammingSection } from './TrammingSection';
import { PistonsSection } from './PistonsSection';

/**
 * Configuration for a single section
 */
export interface SectionConfig {
  /** Unique key for the section (matches enum value) */
  key: string;

  /**
   * React component to render for this section
   * Note: Using `any` here is intentional as section components have different prop requirements
   * (some need serviceType, some need isOpen, etc.) that can't be unified into a single interface.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;

  /** Metadata for displaying the section */
  metadata: {
    /** Path to section image/icon */
    image: string;
    /** i18n translation key for section name */
    i18nKey: string;
  };
}

/**
 * Registry of all available sections
 * Maps section keys to their configuration
 */
export const SECTION_REGISTRY: Record<string, SectionConfig> = {
  BEARING_CLEARANCE: {
    key: 'BEARING_CLEARANCE',
    component: BearingClearanceSection,
    metadata: {
      image: '/assets/sections/bearing-clearance.svg',
      i18nKey: 'bearingClearance',
    },
  },

  SLIDE_SINGLE_HAMMER: {
    key: 'SLIDE_SINGLE_HAMMER',
    component: SlideSingleHammerSection,
    metadata: {
      image: '/assets/sections/slide.svg',
      i18nKey: 'slideSingleHammer',
    },
  },

  SLIDE_DOUBLE_HAMMER: {
    key: 'SLIDE_DOUBLE_HAMMER',
    component: SlideDoubleHammerSection,
    metadata: {
      image: '/assets/sections/slide.svg',
      i18nKey: 'slideDoubleHammer',
    },
  },

  GIBS: {
    key: 'GIBS',
    component: GibsSection,
    metadata: {
      image: '/assets/sections/gibs.svg',
      i18nKey: 'gibs',
    },
    // No badges for gibs section
  },

  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: {
    key: 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
    component: LubricationHydraulicsSection,
    metadata: {
      image: '/assets/sections/lubrication-hydraulics.svg',
      i18nKey: 'lubricationHydraulics',
    },
    // No badges for lubrication section
  },

  CLUTCH: {
    key: 'CLUTCH',
    component: ClutchSection,
    metadata: {
      image: '/assets/sections/clutch.svg',
      i18nKey: 'clutch',
    },
    // No badges for clutch section
  },

  COUNTERBALANCE_CYLINDER_AIRBAG: {
    key: 'COUNTERBALANCE_CYLINDER_AIRBAG',
    component: CounterbalanceCylinderSection,
    metadata: {
      image: '/assets/sections/counterbalance.svg',
      i18nKey: 'counterbalance',
    },
    // No badges for counterbalance section
  },

  TRAMMING: {
    key: 'TRAMMING',
    component: TrammingSection,
    metadata: {
      image: '/assets/sections/tramming.svg',
      i18nKey: 'tramming',
    },
    // No badges for tramming section
  },

  PISTONS: {
    key: 'PISTONS',
    component: PistonsSection,
    metadata: {
      image: '/assets/sections/pistons.svg',
      i18nKey: 'pistons',
    },
    // No badges for pistons section
  },
};

/**
 * Get section configuration by key
 * @param sectionKey - The section key
 * @returns Section configuration or undefined if not found
 */
export function getSectionConfig(sectionKey: string): SectionConfig | undefined {
  return SECTION_REGISTRY[sectionKey];
}

/**
 * Get all registered section keys
 * @returns Array of all section keys
 */
export function getAllSectionKeys(): string[] {
  return Object.keys(SECTION_REGISTRY);
}
