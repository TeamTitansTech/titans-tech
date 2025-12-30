/**
 * Section Subsections Data Structure
 * Defines subsections for each inspection section with parts and diagrams
 */

import type { Part } from './dac-parts';
import {
  BEARING_CLEARANCE_COMMON_PARTS,
  BEARING_CLEARANCE_OUTER_PARTS,
  BEARING_CLEARANCE_OUTER_ADJUSTMENT_PARTS,
  BEARING_CLEARANCE_INNER_PARTS,
  BEARING_CLEARANCE_SHUTHEIGHT_OUTER_PARTS,
  BEARING_CLEARANCE_SHUTHEIGHT_INNER_PARTS,
  SLIDE_OUTER_PARTS,
  SLIDE_INNER_PARTS,
  CLUTCH_SINGLE_GEARED_PARTS,
  CLUTCH_FLYWHEEL_BRAKE_PARTS,
  CLUTCH_MOTOR_DRIVE_PARTS,
  CLUTCH_HYDRAULIC_UNIT_PARTS,
  COUNTERBALANCE_INNER_SLIDE_PARTS,
  COUNTERBALANCE_AIRMOUNT_PARTS,
  LUBRICATION_UNIT_PARTS,
  GIBS_OUTER_PARTS,
  GIBS_INNER_PARTS,
} from './dac-parts';
import { CLUTCH_CEVOLANI_PARTS } from './clutch-cevolani-parts';

/**
 * Subsection definition with parts and optional diagram
 */
export interface Subsection {
  id: string;
  nameKey: string; // Translation key for the subsection name
  figureReference?: string; // e.g., "FIGURE 336B"
  description?: string;
  parts: Part[];
  /** Path to diagram image in public folder */
  diagramImage?: string;
}

/**
 * Section with subsections
 */
export interface SectionWithSubsections {
  sectionId: string;
  subsections: Subsection[];
}

// =============================================================================
// BEARING CLEARANCE SUBSECTIONS
// =============================================================================

export const BEARING_CLEARANCE_SUBSECTIONS: Subsection[] = [
  {
    id: 'crankshaft',
    nameKey: 'subsections.crankshaft',
    figureReference: 'FIGURE 1006B',
    description: 'Main crankshaft bearings and associated components',
    parts: BEARING_CLEARANCE_COMMON_PARTS.filter((p) => p.location?.includes('Crankshaft')),
    diagramImage: '/assets/parts-diagrams/crankshaft.png',
  },
  {
    id: 'outer-slide-standard',
    nameKey: 'subsections.outerSlideStandard',
    figureReference: 'FIGURE 336B',
    description: 'Outer slide assembly components (standard arrangement)',
    parts: BEARING_CLEARANCE_OUTER_PARTS,
    diagramImage: '/assets/parts-diagrams/outer slide parts.png',
  },
  {
    id: 'inner-slide-standard',
    nameKey: 'subsections.innerSlideStandard',
    figureReference: 'FIGURE 337C',
    description: 'Inner slide assembly components (standard arrangement)',
    parts: BEARING_CLEARANCE_INNER_PARTS,
    diagramImage: '/assets/parts-diagrams/inner slide parts.png',
  },
  {
    id: 'outer-slide-adjustment',
    nameKey: 'subsections.outerSlideAdjustment',
    figureReference: 'FIGURE 3021B',
    description: 'Shutheight adjustment mechanism for outer slide',
    parts: BEARING_CLEARANCE_OUTER_ADJUSTMENT_PARTS,
    diagramImage: '/assets/parts-diagrams/outer slide adjustment parts.png',
  },
  {
    id: 'shutheight-indicator-outer',
    nameKey: 'subsections.shutheightIndicatorOuter',
    figureReference: 'FIGURE 338B',
    description: 'Shutheight indicator for outer slide',
    parts: BEARING_CLEARANCE_SHUTHEIGHT_OUTER_PARTS,
    diagramImage: '/assets/parts-diagrams/shutheight indicator parts (outer slide).png',
  },
  {
    id: 'shutheight-indicator-inner',
    nameKey: 'subsections.shutheightIndicatorInner',
    figureReference: 'FIGURE 339B',
    description: 'Shutheight indicator for inner slide',
    parts: BEARING_CLEARANCE_SHUTHEIGHT_INNER_PARTS,
    diagramImage: '/assets/parts-diagrams/SHUTHEIGHT INDICATOR PARTS (INNER SLIDE).png',
  },
];

// =============================================================================
// BEARING CLEARANCE SINGLE HAMMER SUBSECTIONS
// =============================================================================

export const BEARING_CLEARANCE_SINGLE_HAMMER_SUBSECTIONS: Subsection[] = [
  {
    id: 'crankshaft',
    nameKey: 'subsections.crankshaft',
    figureReference: 'FIGURE 1006B',
    description: 'Main crankshaft bearings and associated components',
    parts: BEARING_CLEARANCE_COMMON_PARTS.filter((p) => p.location?.includes('Crankshaft')),
    diagramImage: '/assets/parts-diagrams/crankshaft.png',
  },
  {
    id: 'slide-standard',
    nameKey: 'subsections.slideStandard',
    figureReference: 'FIGURE 336B',
    description: 'Slide assembly components (standard arrangement)',
    parts: BEARING_CLEARANCE_OUTER_PARTS,
    diagramImage: '/assets/parts-diagrams/outer slide parts.png',
  },
  {
    id: 'slide-adjustment',
    nameKey: 'subsections.slideAdjustment',
    figureReference: 'FIGURE 3021B',
    description: 'Shutheight adjustment mechanism for slide',
    parts: BEARING_CLEARANCE_OUTER_ADJUSTMENT_PARTS,
    diagramImage: '/assets/parts-diagrams/outer slide adjustment parts.png',
  },
  {
    id: 'shutheight-indicator',
    nameKey: 'subsections.shutheightIndicator',
    figureReference: 'FIGURE 338B',
    description: 'Shutheight indicator for slide',
    parts: BEARING_CLEARANCE_SHUTHEIGHT_OUTER_PARTS,
    diagramImage: '/assets/parts-diagrams/shutheight indicator parts (outer slide).png',
  },
];

// =============================================================================
// CLUTCH & BRAKE SUBSECTIONS
// =============================================================================

export const CLUTCH_BRAKE_SUBSECTIONS: Subsection[] = [
  {
    id: 'single-geared-drive',
    nameKey: 'subsections.singleGearedDrive',
    figureReference: 'FIGURE 1007C',
    description: 'Single geared twin drive crankshaft assembly',
    parts: CLUTCH_SINGLE_GEARED_PARTS,
    diagramImage: '/assets/parts-diagrams/single geared.png',
  },
  {
    id: 'flywheel-brake',
    nameKey: 'subsections.flywheelBrake',
    figureReference: 'FIGURE 456A',
    description: 'Flywheel brake assembly for press stopping',
    parts: CLUTCH_FLYWHEEL_BRAKE_PARTS,
    diagramImage: '/assets/parts-diagrams/flywheel brake parts.png',
  },
  {
    id: 'motor-drive',
    nameKey: 'subsections.motorDrive',
    figureReference: 'FIGURE 1111A',
    description: 'Main motor drive assembly (Straight Side Presses)',
    parts: CLUTCH_MOTOR_DRIVE_PARTS,
    diagramImage: '/assets/parts-diagrams/motor drive parts.png',
  },
  {
    id: 'hydraulic-unit',
    nameKey: 'subsections.hydraulicUnit',
    figureReference: 'FIGURE 578C',
    description: 'Hydraulic clutch actuation system (optional)',
    parts: CLUTCH_HYDRAULIC_UNIT_PARTS,
    diagramImage: '/assets/parts-diagrams/hydraulic unit parts.png',
  },
];

// =============================================================================
// CLUTCH CEVOLANI SUBSECTIONS
// =============================================================================

export const CLUTCH_CEVOLANI_SUBSECTIONS: Subsection[] = [
  {
    id: 'clutch-cevolani',
    nameKey: 'subsections.clutchCevolani',
    description: 'Cevolani clutch assembly parts',
    parts: CLUTCH_CEVOLANI_PARTS,
    diagramImage: '/assets/parts-diagrams/clutch_cevolani.png',
  },
];

// =============================================================================
// COUNTERBALANCE SUBSECTIONS
// =============================================================================

export const COUNTERBALANCE_SUBSECTIONS: Subsection[] = [
  {
    id: 'counterbalance-inner',
    nameKey: 'subsections.counterbalanceInner',
    figureReference: 'FIGURE 491B',
    description: 'Pneumatic counterbalance cylinder assembly for inner slide',
    parts: COUNTERBALANCE_INNER_SLIDE_PARTS,
    diagramImage: '/assets/parts-diagrams/counterbalance parts.png',
  },
  {
    id: 'counterbalance-outer-airmount',
    nameKey: 'subsections.counterbalanceOuterAirmount',
    figureReference: 'FIGURE 492',
    description: 'Air-mount counterbalance system for outer slide (high-speed config)',
    parts: COUNTERBALANCE_AIRMOUNT_PARTS,
    diagramImage: '/assets/parts-diagrams/airmount type counterbalance parts.png',
  },
];

// =============================================================================
// LUBRICATION SUBSECTIONS
// =============================================================================

export const LUBRICATION_SUBSECTIONS: Subsection[] = [
  {
    id: 'lubrication-unit',
    nameKey: 'subsections.lubricationUnit',
    figureReference: 'FIGURE 577A',
    description: 'Centralized automatic lubrication system',
    parts: LUBRICATION_UNIT_PARTS,
    diagramImage: '/assets/parts-diagrams/lubrication unit parts.png',
  },
];

// =============================================================================
// SLIDE SUBSECTIONS
// =============================================================================

export const SLIDE_SUBSECTIONS: Subsection[] = [
  {
    id: 'outer-slide',
    nameKey: 'subsections.outerSlide',
    figureReference: 'FIGURE 336B',
    description: 'Outer slide assembly components',
    parts: SLIDE_OUTER_PARTS,
    diagramImage: '/assets/parts-diagrams/outer slide parts.png',
  },
  {
    id: 'inner-slide',
    nameKey: 'subsections.innerSlide',
    figureReference: 'FIGURE 337C',
    description: 'Inner slide assembly components',
    parts: SLIDE_INNER_PARTS,
    diagramImage: '/assets/parts-diagrams/inner slide parts.png',
  },
];

// =============================================================================
// GIBS SUBSECTIONS
// =============================================================================

export const GIBS_SUBSECTIONS: Subsection[] = [
  {
    id: 'gibs-outer',
    nameKey: 'subsections.gibsOuter',
    figureReference: 'FIGURE 336B',
    description: 'Outer slide gibs and wear plates',
    parts: GIBS_OUTER_PARTS,
    diagramImage: '/assets/parts-diagrams/gibs-outer.png',
  },
  {
    id: 'gibs-inner',
    nameKey: 'subsections.gibsInner',
    figureReference: 'FIGURE 337C',
    description: 'Inner slide gibs and wear plates',
    parts: GIBS_INNER_PARTS,
    diagramImage: '/assets/parts-diagrams/gibs-inner.png',
  },
];

// =============================================================================
// SECTION MAPPING
// =============================================================================

/**
 * Map of section IDs to their subsections
 */
export const SECTION_SUBSECTIONS_MAP: Record<string, Subsection[]> = {
  BEARING_CLEARANCE: BEARING_CLEARANCE_SUBSECTIONS,
  BEARING_CLEARANCE_SINGLE_HAMMER: BEARING_CLEARANCE_SINGLE_HAMMER_SUBSECTIONS,
  CLUTCH: CLUTCH_BRAKE_SUBSECTIONS,
  CLUTCH_CEVOLANI: CLUTCH_CEVOLANI_SUBSECTIONS,
  COUNTERBALANCE_CYLINDER_AIRBAG: COUNTERBALANCE_SUBSECTIONS,
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: LUBRICATION_SUBSECTIONS,
  SLIDE_SINGLE_HAMMER: SLIDE_SUBSECTIONS,
  SLIDE_DOUBLE_HAMMER: SLIDE_SUBSECTIONS,
  GIBS: GIBS_SUBSECTIONS,
};

/**
 * Get subsections for a given section ID
 */
export function getSubsectionsForSection(sectionId: string): Subsection[] {
  return SECTION_SUBSECTIONS_MAP[sectionId] || [];
}

/**
 * Check if a section has subsections defined
 */
export function sectionHasSubsections(sectionId: string): boolean {
  const subsections = SECTION_SUBSECTIONS_MAP[sectionId];
  return subsections !== undefined && subsections.length > 0;
}
