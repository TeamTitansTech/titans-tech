/**
 * DAC Series Parts Data
 * Double-Action Cupping & Double-Action Shell Presses
 * DAC, DACI & DAS Series - Manual Number 1008J
 * Manufacturer: The Minster Machine Company
 */

export interface Part {
  partNumber: string;
  description: string;
  quantity: number | string;
  unit: string;
  location?: string;
  notes?: string;
}

export interface SectionWithTabs {
  outer: Part[];
  inner: Part[];
}

export interface InspectionSection {
  id: string;
  name: string;
  description: string;
  relatedFigures: string[];
  parts: Part[];
}

export interface ManualInfo {
  title: string;
  series: string;
  manualNumber: string;
  manufacturer: string;
}

export interface InspectionNotes {
  orderingInstructions: string[];
  abbreviations: Record<string, string>;
  inspectionGuidelines: Record<string, string>;
}

// Manual Information
export const DAC_MANUAL_INFO: ManualInfo = {
  title: 'Double-Action Cupping & Double-Action Shell Presses',
  series: 'DAC, DACI & DAS Series',
  manualNumber: '1008J',
  manufacturer: 'The Minster Machine Company',
};

// ============================================================================
// BEARING CLEARANCE PARTS
// ============================================================================

// Common Bearing Parts (Crankshaft & Driveshaft - shared across outer/inner)
export const BEARING_CLEARANCE_COMMON_PARTS: Part[] = [
  // Crankshaft Bearings (Figure 1006B)
  {
    partNumber: '1006B-12',
    description: 'Main Bearing Bushing',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft - Main',
  },
  {
    partNumber: '1006B-14',
    description: 'Main Bearing Bushing (Middle)',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft - Middle',
  },
  {
    partNumber: '1006B-14-1',
    description: 'Main Bearing Bushing (Outer)',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft - Outer',
  },
  {
    partNumber: '1006B-14-2',
    description: 'Main Bearing Bushing (Center)',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft - Center',
  },
  {
    partNumber: '1006B-19',
    description: 'Main Bearing Cap',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft',
  },
  {
    partNumber: '1006B-32',
    description: 'Center Bearing Cap',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft - Center',
  },
  {
    partNumber: '1006B-32-1',
    description: 'Center Bearing Cap',
    quantity: 2,
    unit: 'EA',
    location: 'Crankshaft - Center',
  },
  // Driveshaft Bearings (Figure 1007C)
  {
    partNumber: '1007C-436',
    description: 'Driveshaft Bearing (R.H.)',
    quantity: 1,
    unit: 'EA',
    location: 'Driveshaft - Right Hand',
  },
  {
    partNumber: '1007C-438',
    description: 'Driveshaft Bearing (L.H.)',
    quantity: 1,
    unit: 'EA',
    location: 'Driveshaft - Left Hand',
  },
  {
    partNumber: '1007C-446',
    description: 'Driveshaft Center Bearing',
    quantity: 1,
    unit: 'EA',
    location: 'Driveshaft - Center',
  },
  {
    partNumber: '1007C-446-1',
    description: 'Driveshaft Center Bearing',
    quantity: 1,
    unit: 'EA',
    location: 'Driveshaft - Center',
    notes: 'Optional part',
  },
  {
    partNumber: '1007C-1000',
    description: 'Bearing',
    quantity: 2,
    unit: 'EA',
    location: 'Driveshaft',
  },
  {
    partNumber: '1007C-1001',
    description: 'Bearing',
    quantity: 1,
    unit: 'EA',
    location: 'Driveshaft',
  },
  {
    partNumber: '1007C-1002',
    description: 'Bearing',
    quantity: 1,
    unit: 'EA',
    location: 'Driveshaft',
    notes: 'Optional part',
  },
];

// Outer Slide Bearing Parts
export const BEARING_CLEARANCE_OUTER_PARTS: Part[] = [
  // Outer Slide Adjustment Bearings (Figure 3021B)
  {
    partNumber: '3021B-1000',
    description: 'Bearing',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide Adjustment',
  },
  {
    partNumber: '3021B-1001',
    description: 'Bearing',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide Adjustment',
  },
  // Outer Slide V-Roller Bearings (Figure 3022B)
  {
    partNumber: '3022B-1438',
    description: 'Roller Guide Bearing (Flat)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1439',
    description: 'Roller Guide Bearing (V-Groove)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1002',
    description: 'Bearing',
    quantity: 8,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
];

// Inner Slide Bearing Parts
export const BEARING_CLEARANCE_INNER_PARTS: Part[] = [
  // Inner Slide Bearings (Figure 337C)
  {
    partNumber: '337C-1003',
    description: 'Bearing',
    quantity: 4,
    unit: 'EA',
    location: 'Inner Slide',
  },
  // Inner Slide V-Roller Bearings (Figure 3023B)
  {
    partNumber: '3023B-1004',
    description: 'Bearing',
    quantity: 4,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1440',
    description: 'Roller Guide Bearing (Flat)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1441',
    description: 'Roller Guide Bearing (V-Groove)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1005',
    description: 'Bearing',
    quantity: 8,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
];

// Combined for backwards compatibility
export const BEARING_CLEARANCE_PARTS: Part[] = [
  ...BEARING_CLEARANCE_COMMON_PARTS,
  ...BEARING_CLEARANCE_OUTER_PARTS,
  ...BEARING_CLEARANCE_INNER_PARTS,
];

// Structured with tabs
export const BEARING_CLEARANCE_TABS: SectionWithTabs = {
  outer: [...BEARING_CLEARANCE_COMMON_PARTS, ...BEARING_CLEARANCE_OUTER_PARTS],
  inner: [...BEARING_CLEARANCE_COMMON_PARTS, ...BEARING_CLEARANCE_INNER_PARTS],
};

// ============================================================================
// CLUTCH AND BRAKE PARTS
// ============================================================================

export const CLUTCH_BRAKE_CLEARANCE_PARTS: Part[] = [
  // Flywheel Brake (Figure 456A)
  {
    partNumber: '456A-36',
    description: 'Flywheel Brake Housing',
    quantity: 2,
    unit: 'EA',
    location: 'Flywheel',
  },
  {
    partNumber: '456A-37',
    description: 'Flywheel Brake Piston',
    quantity: 2,
    unit: 'EA',
    location: 'Flywheel',
  },
  {
    partNumber: '456A-185',
    description: 'Flywheel Brake Shoe',
    quantity: 2,
    unit: 'EA',
    location: 'Flywheel',
  },
  {
    partNumber: '456A-192',
    description: 'Brake Anchor Plate',
    quantity: 1,
    unit: 'EA',
    location: 'Flywheel',
  },
  {
    partNumber: '456A-567',
    description: 'End Plate Cover',
    quantity: 2,
    unit: 'EA',
    location: 'Flywheel',
  },
  {
    partNumber: '456A-568',
    description: 'Connecting Tube',
    quantity: 1,
    unit: 'EA',
    location: 'Flywheel Brake',
  },
  {
    partNumber: '456A-1014',
    description: 'Quad-X Ring',
    quantity: 4,
    unit: 'EA',
    location: 'Flywheel Brake',
  },
  {
    partNumber: '456A-3800',
    description: 'Wave Spring',
    quantity: 2,
    unit: 'EA',
    location: 'Flywheel Brake',
  },
  {
    partNumber: '456A-4250',
    description: 'Pressure Switch',
    quantity: 1,
    unit: 'EA',
    location: 'Flywheel Brake',
  },
  // Auxiliary Caliper Brake (Figure 495) - Optional
  {
    partNumber: '495-7',
    description: 'Piston Stop',
    quantity: 4,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-8',
    description: 'Plate',
    quantity: 2,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-13',
    description: 'Piston',
    quantity: 2,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-14',
    description: 'Facing',
    quantity: 2,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-88',
    description: 'Outside Housing',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-89',
    description: 'Inside Housing',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-807',
    description: 'Brake Disc',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-2025',
    description: 'Piston Seal',
    quantity: 2,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-2026',
    description: 'Rod Seal',
    quantity: 2,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-2027',
    description: 'Wiper Seal',
    quantity: 2,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
  {
    partNumber: '495-3801',
    description: 'Spring',
    quantity: 4,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake',
    notes: 'Optional',
  },
];

// ============================================================================
// SLIDE PARTS
// ============================================================================

// Outer Slide Parts (Standard - Figure 336B & V-Roller - Figure 3022B)
export const SLIDE_OUTER_PARTS: Part[] = [
  // Outer Slide Standard (Figure 336B)
  {
    partNumber: '336B-3',
    description: 'Outer Slide',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide Assembly',
  },
  {
    partNumber: '336B-3-1',
    description: 'Slide Adjust Nut',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-4',
    description: 'Slide Adjust Worm Gear',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-8',
    description: 'Slide Adjust Sleeve',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-13',
    description: 'Outer Connection Bushing',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Connection',
  },
  {
    partNumber: '336B-13-1',
    description: 'Connection Pin',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Connection',
  },
  {
    partNumber: '336B-14',
    description: 'Connection Pin Bushing',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide Connection',
  },
  {
    partNumber: '336B-15',
    description: 'Connection (Outer)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-143',
    description: 'Slide Wear Plate',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-139',
    description: 'Slide Wear Plate Adjust Wedge',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-598',
    description: 'Gib Wear Plate (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-599',
    description: 'Gib Wear Plate (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218',
    description: 'Slide Oil Trough (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218-1',
    description: 'Slide Oil Trough (L.H.R.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218-2',
    description: 'Slide Oil Trough (R.H.R.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218-3',
    description: 'Slide Oil Trough (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  // Outer Slide V-Roller (Figure 3022B) - Alternate configuration
  {
    partNumber: '3022B-3',
    description: 'Outer Slide (V-Roller)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide V-Roller Assembly',
    notes: 'Alternate configuration',
  },
  {
    partNumber: '3022B-716',
    description: 'Bearing Shaft',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1304',
    description: 'Gib Bearing Bracket',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1438',
    description: 'Roller Guide Bearing (Flat)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1439',
    description: 'Roller Guide Bearing (V-Groove)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1460',
    description: 'V-Groove Load Runner',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1461',
    description: 'Flat Load Runner',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
  {
    partNumber: '3022B-1002',
    description: 'Bearing',
    quantity: 8,
    unit: 'EA',
    location: 'Outer Slide V-Roller',
  },
];

// Inner Slide Parts (Standard - Figure 337C & V-Roller - Figure 3023B)
export const SLIDE_INNER_PARTS: Part[] = [
  // Inner Slide Standard (Figure 337C)
  {
    partNumber: '337C-3',
    description: 'Inner Slide',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Assembly',
  },
  {
    partNumber: '337C-3-1',
    description: 'Slide Adjust Nut',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide',
  },
  {
    partNumber: '337C-4',
    description: 'Slide Adjust Worm Gear',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide',
  },
  {
    partNumber: '337C-8',
    description: 'Slide Adjust Sleeve',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide',
  },
  {
    partNumber: '337C-13',
    description: 'Connection Bushing',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide Connection',
  },
  {
    partNumber: '337C-13-1',
    description: 'Connection Pin',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide Connection',
  },
  {
    partNumber: '337C-14',
    description: 'Connection Pin Bushing',
    quantity: 4,
    unit: 'EA',
    location: 'Inner Slide Connection',
  },
  {
    partNumber: '337C-15',
    description: 'Connection (Inner)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide',
  },
  {
    partNumber: '337C-143',
    description: 'Slide Wear Plate (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Front',
  },
  {
    partNumber: '337C-143-1',
    description: 'Slide Wear Plate (L.H.R.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Rear',
  },
  {
    partNumber: '337C-144',
    description: 'Slide Wear Plate (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Front',
  },
  {
    partNumber: '337C-144-1',
    description: 'Slide Wear Plate (R.H.R.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Rear',
  },
  {
    partNumber: '337C-550',
    description: 'Inner Slide Gib (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Front',
  },
  {
    partNumber: '337C-551',
    description: 'Inner Slide Gib (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Front',
  },
  {
    partNumber: '337C-145',
    description: 'Inner Slide Gib (Rear)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide - Rear',
  },
  {
    partNumber: '337C-427',
    description: 'Slide Oil Screen (Inner)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide',
  },
  // Inner Slide V-Roller (Figure 3023B) - Alternate configuration
  {
    partNumber: '3023B-3',
    description: 'Inner Slide (V-Roller)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide V-Roller Assembly',
    notes: 'Alternate configuration',
  },
  {
    partNumber: '3023B-716',
    description: 'Bearing Shaft',
    quantity: 4,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1304',
    description: 'Gib Bearing Bracket',
    quantity: 4,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1440',
    description: 'Roller Guide Bearing (Flat)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1441',
    description: 'Roller Guide Bearing (V-Groove)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1462',
    description: 'V-Groove Load Runner',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1463',
    description: 'Flat Load Runner',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1004',
    description: 'Bearing',
    quantity: 4,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
  {
    partNumber: '3023B-1005',
    description: 'Bearing',
    quantity: 8,
    unit: 'EA',
    location: 'Inner Slide V-Roller',
  },
];

// Combined for backwards compatibility
export const SLIDE_PARTS: Part[] = [...SLIDE_OUTER_PARTS, ...SLIDE_INNER_PARTS];

// Structured with tabs
export const SLIDE_TABS: SectionWithTabs = {
  outer: SLIDE_OUTER_PARTS,
  inner: SLIDE_INNER_PARTS,
};

// ============================================================================
// GIBS PARTS
// ============================================================================

// Frame Gibs (shared)
export const GIBS_FRAME_PARTS: Part[] = [
  {
    partNumber: '155A-8',
    description: 'Gib (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-9',
    description: 'Gib (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
];

// Outer Slide Gibs (Figure 336B)
export const GIBS_OUTER_PARTS: Part[] = [
  ...GIBS_FRAME_PARTS,
  {
    partNumber: '336B-598',
    description: 'Gib Wear Plate (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-599',
    description: 'Gib Wear Plate (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946',
    description: 'Gib Oil Deflector (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946-1',
    description: 'Gib Oil Deflector (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946-2',
    description: 'Gib Oil Deflector (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946-3',
    description: 'Gib Oil Deflector (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
];

// Inner Slide Gibs (Figure 337C)
export const GIBS_INNER_PARTS: Part[] = [
  ...GIBS_FRAME_PARTS,
  {
    partNumber: '337C-550',
    description: 'Inner Slide Gib (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Front',
  },
  {
    partNumber: '337C-551',
    description: 'Inner Slide Gib (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Front',
  },
  {
    partNumber: '337C-145',
    description: 'Inner Slide Gib (Rear)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide - Rear',
  },
  {
    partNumber: '337C-894',
    description: 'Gib Backup Plate (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Front',
  },
  {
    partNumber: '337C-895',
    description: 'Gib Backup Plate (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Front',
  },
  {
    partNumber: '337C-946',
    description: 'Gib Oil Deflector (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide',
  },
  {
    partNumber: '337C-946-1',
    description: 'Gib Oil Deflector (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide',
  },
];

// Combined for backwards compatibility
export const GIBS_PARTS: Part[] = [
  ...GIBS_FRAME_PARTS,
  // Outer specific
  {
    partNumber: '336B-598',
    description: 'Gib Wear Plate (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-599',
    description: 'Gib Wear Plate (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946',
    description: 'Gib Oil Deflector (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946-1',
    description: 'Gib Oil Deflector (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946-2',
    description: 'Gib Oil Deflector (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-946-3',
    description: 'Gib Oil Deflector (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide',
  },
  // Inner specific
  {
    partNumber: '337C-550',
    description: 'Inner Slide Gib (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Front',
  },
  {
    partNumber: '337C-551',
    description: 'Inner Slide Gib (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Front',
  },
  {
    partNumber: '337C-145',
    description: 'Inner Slide Gib (Rear)',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide - Rear',
  },
  {
    partNumber: '337C-894',
    description: 'Gib Backup Plate (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Right Hand Front',
  },
  {
    partNumber: '337C-895',
    description: 'Gib Backup Plate (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide - Left Hand Front',
  },
  {
    partNumber: '337C-946',
    description: 'Gib Oil Deflector (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide',
  },
  {
    partNumber: '337C-946-1',
    description: 'Gib Oil Deflector (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide',
  },
];

// Structured with tabs
export const GIBS_TABS: SectionWithTabs = {
  outer: GIBS_OUTER_PARTS,
  inner: GIBS_INNER_PARTS,
};

// ============================================================================
// LUBRICATION PARTS
// ============================================================================

export const LUBRICATION_PARTS: Part[] = [
  // Lubrication Unit (Figure 577A)
  {
    partNumber: '577A-1550',
    description: 'Lube Motor',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-1700',
    description: 'Lube Pump',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-1325',
    description: 'Coupling',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-1',
    description: 'Lubricator Bracket',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-19',
    description: 'Filter Mounting Bracket',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-1750',
    description: 'Oil Filter',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-1675',
    description: 'Filter Cartridge',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-4225',
    description: 'Vacuum Switch',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-5100',
    description: 'Pressure Gauge (Lube)',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-5150',
    description: 'Vacuum Gauge',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-4978',
    description: 'Shutoff Valve',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-4979',
    description: 'Shutoff Valve',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-3500',
    description: 'Shock Mount',
    quantity: 4,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  // Frame Oil Troughs (Figure 155A)
  {
    partNumber: '155A-205',
    description: 'Oil Trough (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-205-1',
    description: 'Oil Trough (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418',
    description: 'Oil Trough Screen (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418-1',
    description: 'Oil Trough Screen (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418-2',
    description: 'Oil Trough Screen (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418-3',
    description: 'Oil Trough Screen (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  // Outer Slide Oil Troughs (Figure 336B)
  {
    partNumber: '336B-218',
    description: 'Slide Oil Trough (R.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218-1',
    description: 'Slide Oil Trough (L.H.R.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218-2',
    description: 'Slide Oil Trough (R.H.R.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  {
    partNumber: '336B-218-3',
    description: 'Slide Oil Trough (L.H.F.)',
    quantity: 1,
    unit: 'EA',
    location: 'Outer Slide',
  },
  // Inner Slide Oil Components (Figure 337C)
  {
    partNumber: '337C-427',
    description: 'Slide Oil Screen (Inner)',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide',
  },
  // Flow Control System (Figure 579B)
  {
    partNumber: '579B-4200',
    description: 'Flow Switch',
    quantity: 13,
    unit: 'EA',
    location: 'Flow Control Panel',
    notes: 'Actual part may vary',
  },
  {
    partNumber: '579B-4201',
    description: 'Flow Switch',
    quantity: 4,
    unit: 'EA',
    location: 'Flow Control Panel',
    notes: 'Actual part may vary',
  },
];

// ============================================================================
// HYDRAULICS PARTS
// ============================================================================

export const HYDRAULICS_PARTS: Part[] = [
  {
    partNumber: '578C-1551',
    description: 'Hydraulic Unit Motor',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1576',
    description: 'Hydraulic Pump',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1325',
    description: 'Coupling',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1425',
    description: 'Motor/Pump Flange',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4051',
    description: 'Reservoir',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1625',
    description: 'Strainer',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1752',
    description: 'Oil Filter (Bowl & Head Assembly)',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1775',
    description: 'Filter Element',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4990',
    description: 'Relief Valve',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4985',
    description: 'Hydraulic Spool Valve (Clutch)',
    quantity: 2,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4986',
    description: 'Check Cartridge Valve',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4991',
    description: 'Directional Control Valve (Safety Dump)',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4992',
    description: 'Dump Valve',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-5301',
    description: 'Accumulator',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4984',
    description: 'Directional Control Valve (Accumulator Isolation)',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '494A-1575',
    description: 'Hydraulic Pump',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '494A-4050',
    description: 'Oil Reservoir',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '494A-5300',
    description: 'Accumulator',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '494A-964',
    description: 'Hydraulic Manifold',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '578C-5925',
    description: 'Manifold',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
];

// ============================================================================
// PRESSURE SWITCHES PARTS
// ============================================================================

export const PRESSURE_SWITCHES_PARTS: Part[] = [
  {
    partNumber: '456A-4250',
    description: 'Pressure Switch',
    quantity: 1,
    unit: 'EA',
    location: 'Flywheel Brake',
  },
  {
    partNumber: '494A-4251',
    description: 'Pressure Switch',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '578C-4251',
    description: 'Pressure Switch (Clutch)',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '496B-1254',
    description: 'Pressure Switch Assembly',
    quantity: 1,
    unit: 'EA',
    location: 'Die Supply Pneumatic System',
  },
  {
    partNumber: '578C-4275',
    description: 'Low Level Switch',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '577A-4225',
    description: 'Vacuum Switch',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-5100',
    description: 'Pressure Gauge (Lube)',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '578C-1800',
    description: 'Pressure Gauge',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '494A-5101',
    description: 'Pressure Gauge',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '496B-1801',
    description: 'Pressure Gauge',
    quantity: 'AR',
    unit: 'EA',
    location: 'Die Supply Pneumatic System',
  },
  {
    partNumber: '496B-1802',
    description: 'Pressure Gauge',
    quantity: 1,
    unit: 'EA',
    location: 'Die Supply Pneumatic System',
  },
];

// ============================================================================
// OIL FILTER PARTS
// ============================================================================

export const OIL_FILTER_PARTS: Part[] = [
  {
    partNumber: '577A-1750',
    description: 'Oil Filter',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '577A-1675',
    description: 'Filter Cartridge',
    quantity: 1,
    unit: 'EA',
    location: 'Lubrication Unit',
  },
  {
    partNumber: '578C-1752',
    description: 'Oil Filter (Bowl & Head Assembly)',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1775',
    description: 'Filter Element',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '578C-1625',
    description: 'Strainer',
    quantity: 1,
    unit: 'EA',
    location: 'Hydraulic Unit',
    notes: 'Optional',
  },
  {
    partNumber: '494A-1751',
    description: 'Oil Filter',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '494A-1676',
    description: 'Filter Cartridge',
    quantity: 1,
    unit: 'EA',
    location: 'Auxiliary Caliper Brake Hydraulic',
    notes: 'Optional',
  },
  {
    partNumber: '155A-418',
    description: 'Oil Trough Screen (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418-1',
    description: 'Oil Trough Screen (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418-2',
    description: 'Oil Trough Screen (L.H.F. & R.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
  {
    partNumber: '155A-418-3',
    description: 'Oil Trough Screen (R.H.F. & L.H.R.)',
    quantity: 2,
    unit: 'EA',
    location: 'Frame',
  },
];

// ============================================================================
// COUNTERBALANCE PARTS
// ============================================================================

// Outer Slide Counterbalance (Figure 415B)
export const COUNTERBALANCE_OUTER_PARTS: Part[] = [
  {
    partNumber: '415B-1',
    description: 'Air Cylinder',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-2',
    description: 'Air Cylinder Head',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-3',
    description: 'Air Cylinder Cover',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-4',
    description: 'Air Cylinder Piston',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-7',
    description: 'Piston Rod',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-14',
    description: 'Piston Rod Bushing',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-2300',
    description: 'U Packing',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-1810',
    description: 'Drain Cock',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-13',
    description: 'Counterbalance Bracket',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-32',
    description: 'Cylinder Bracket',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-2301',
    description: 'Cylinder Head Packing',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-2302',
    description: 'Piston Packing',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-3060',
    description: 'O-Ring',
    quantity: 4,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  {
    partNumber: '415B-3061',
    description: 'O-Ring',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide Counterbalance',
  },
  // Airmount (Optional high-speed - Figure 492)
  {
    partNumber: '492-2850',
    description: 'Airmount',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide - High Speed',
    notes: 'Optional high-speed arrangement',
  },
  {
    partNumber: '492-13',
    description: 'Counterbalance Bracket',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide - High Speed',
    notes: 'Optional',
  },
  {
    partNumber: '492-32',
    description: 'Airmount Counterbalance Bracket',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide - High Speed',
    notes: 'Optional',
  },
];

// Inner Slide Counterbalance (Figure 491B)
export const COUNTERBALANCE_INNER_PARTS: Part[] = [
  {
    partNumber: '491B-1',
    description: 'Air Cylinder',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-2-A',
    description: 'Air Cylinder Head',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-3',
    description: 'Air Cylinder Cover',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-4',
    description: 'Piston',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-7',
    description: 'Piston Rod',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-8',
    description: 'Air Cylinder Packing',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-9A',
    description: 'Piston Rod Packing',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-10',
    description: 'Piston Rod Gland Ring',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-14',
    description: 'Piston Rod Bushing',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-13',
    description: 'Counterbalance Bracket',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-32',
    description: 'Cylinder Bracket',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-1810',
    description: 'Drain Cock',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-3060',
    description: 'O-Ring',
    quantity: 2,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-3061',
    description: 'O-Ring',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
  {
    partNumber: '491B-3062',
    description: 'O-Ring',
    quantity: 1,
    unit: 'EA',
    location: 'Inner Slide Counterbalance',
  },
];

// Combined for backwards compatibility
export const COUNTERBALANCE_CYLINDER_PARTS: Part[] = [
  ...COUNTERBALANCE_OUTER_PARTS.filter((p) => !p.partNumber.startsWith('492')),
  ...COUNTERBALANCE_INNER_PARTS,
];

// Airbag (Airmount) Parts
export const AIRBAG_PARTS: Part[] = [
  {
    partNumber: '492-2850',
    description: 'Airmount',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide - High Speed',
    notes: 'Optional high-speed arrangement',
  },
  {
    partNumber: '492-13',
    description: 'Counterbalance Bracket',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide - High Speed',
  },
  {
    partNumber: '492-32',
    description: 'Airmount Counterbalance Bracket',
    quantity: 2,
    unit: 'EA',
    location: 'Outer Slide - High Speed',
  },
  {
    partNumber: '493A-1-B',
    description: 'Air Tank (Clutch)',
    quantity: 1,
    unit: 'EA',
    location: 'Air Clutch Equipment',
    notes: 'Optional',
  },
  {
    partNumber: '496B-1',
    description: 'Air Tank',
    quantity: 'AR',
    unit: 'EA',
    location: 'Die Supply Pneumatic System',
  },
];

// Combined counterbalance parts (with airbag)
export const COUNTERBALANCE_PARTS: Part[] = [
  ...COUNTERBALANCE_OUTER_PARTS,
  ...COUNTERBALANCE_INNER_PARTS,
];

// Structured with tabs
export const COUNTERBALANCE_TABS: SectionWithTabs = {
  outer: COUNTERBALANCE_OUTER_PARTS,
  inner: COUNTERBALANCE_INNER_PARTS,
};

// ============================================================================
// INSPECTION SECTIONS
// ============================================================================

export const DAC_INSPECTION_SECTIONS: InspectionSection[] = [
  {
    id: 'bearing-clearance',
    name: 'Bearing Clearance',
    description: 'Main bearings, crankshaft bearings, and drive bearings',
    relatedFigures: ['1006B', '1007C', '3021B', '3022B', '337C', '3023B'],
    parts: BEARING_CLEARANCE_PARTS,
  },
  {
    id: 'clutch-brake-clearance',
    name: 'Clutch and Brake Clearance',
    description: 'Flywheel brake components and clearances',
    relatedFigures: ['456A', '495'],
    parts: CLUTCH_BRAKE_CLEARANCE_PARTS,
  },
  {
    id: 'slide',
    name: 'Slide',
    description: 'Outer and inner slide assemblies',
    relatedFigures: ['336B', '337C', '3022B', '3023B'],
    parts: SLIDE_PARTS,
  },
  {
    id: 'gibs',
    name: 'Gibs',
    description: 'Gib wear plates and adjustments',
    relatedFigures: ['155A', '336B', '337C'],
    parts: GIBS_PARTS,
  },
  {
    id: 'lubrication',
    name: 'Lubrication',
    description: 'Lubrication system components',
    relatedFigures: ['577A', '579B', '155A', '336B', '337C'],
    parts: LUBRICATION_PARTS,
  },
  {
    id: 'hydraulics',
    name: 'Hydraulics',
    description: 'Hydraulic system components',
    relatedFigures: ['578C', '494A'],
    parts: HYDRAULICS_PARTS,
  },
  {
    id: 'pressure-switches',
    name: 'Pressure Switches',
    description: 'Pressure monitoring and control switches',
    relatedFigures: ['456A', '494A', '496B', '578C'],
    parts: PRESSURE_SWITCHES_PARTS,
  },
  {
    id: 'oil-filter',
    name: 'Oil Filter',
    description: 'Oil filtration components',
    relatedFigures: ['577A', '578C', '494A'],
    parts: OIL_FILTER_PARTS,
  },
  {
    id: 'counterbalance-cylinder',
    name: 'Counterbalance Cylinder',
    description: 'Air cylinder counterbalance system',
    relatedFigures: ['415B', '491B'],
    parts: COUNTERBALANCE_CYLINDER_PARTS,
  },
  {
    id: 'airbag',
    name: 'Airbag (Airmount)',
    description: 'Airmount type counterbalance system for high-speed operation',
    relatedFigures: ['492'],
    parts: AIRBAG_PARTS,
  },
];

// ============================================================================
// NOTES AND GUIDELINES
// ============================================================================

export const DAC_INSPECTION_NOTES: InspectionNotes = {
  orderingInstructions: [
    'Specify serial number of MINSTER press',
    'Specify figure and item number of part',
    'Specify name and quantity of part',
    'Specify how and where to ship',
  ],
  abbreviations: {
    AR: 'As Required - quantity varies by press configuration',
    'R.H.': 'Right Hand',
    'L.H.': 'Left Hand',
    'F.': 'Front',
    'R.': 'Rear',
    'R.H.F.': 'Right Hand Front',
    'L.H.F.': 'Left Hand Front',
    'R.H.R.': 'Right Hand Rear',
    'L.H.R.': 'Left Hand Rear',
  },
  inspectionGuidelines: {
    bearingClearance:
      'Measure clearances with feeler gauges or dial indicators. Compare to specifications. Replace bearings if clearance exceeds maximum limit.',
    clutchBrake:
      'Inspect brake shoe lining thickness, measure disc thickness if equipped with caliper brake. Check pressure switch operation. Adjust clearances per specifications.',
    slide:
      'Inspect wear plates for thickness and surface condition. Check connection pin bushings for wear. Adjust slide wear plate wedges as needed. Verify slide adjustment mechanism operation.',
    gibs: 'Measure gib wear surface thickness. Check for scoring or excessive wear. Inspect oil deflectors for damage. Replace gibs when wear exceeds specifications.',
    lubrication:
      'Check oil level, filter condition (replace cartridge per schedule). Test flow switches and verify pressure/vacuum gauge readings. Inspect oil troughs and screens for cleanliness.',
    hydraulics: 'Verify pressure settings, check for leaks, inspect accumulator pre-charge.',
    pressureSwitches: 'Test all pressure switches for proper operation and accurate settings.',
    oilFilter:
      'Replace filter cartridges per maintenance schedule or when pressure differential indicates.',
    counterbalanceCylinder:
      'Check air pressure in cylinders or airmounts. Inspect all seals, packings, and O-rings for leaks or deterioration. Check piston rod for straightness and surface damage. Verify drain cock operation.',
    airbag: 'Verify airmount pressure and condition. Check for any visible damage or leaks.',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPartsBySection(sectionId: string): Part[] {
  const section = DAC_INSPECTION_SECTIONS.find((s) => s.id === sectionId);
  return section?.parts || [];
}

export function getSectionById(sectionId: string): InspectionSection | undefined {
  return DAC_INSPECTION_SECTIONS.find((s) => s.id === sectionId);
}

export function getAllParts(): Part[] {
  return DAC_INSPECTION_SECTIONS.flatMap((section) => section.parts);
}

export function searchParts(query: string): Part[] {
  const lowerQuery = query.toLowerCase();
  return getAllParts().filter(
    (part) =>
      part.partNumber.toLowerCase().includes(lowerQuery) ||
      part.description.toLowerCase().includes(lowerQuery) ||
      part.location?.toLowerCase().includes(lowerQuery),
  );
}

// Combined parts exports for section components
export const LUBRICATION_HYDRAULICS_PARTS: Part[] = [
  ...LUBRICATION_PARTS,
  ...HYDRAULICS_PARTS,
  ...PRESSURE_SWITCHES_PARTS,
  ...OIL_FILTER_PARTS,
];
