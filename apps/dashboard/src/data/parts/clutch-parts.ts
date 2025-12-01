/**
 * Clutch & Brake Parts List
 * Parts that may need replacement during clutch inspection/maintenance
 */

export interface Part {
  partNumber: string;
  description: string;
  quantity: number | string;
  unit: string;
  location?: string;
  notes?: string;
}

export const CLUTCH_BRAKE_PARTS: Part[] = [
  { partNumber: '6073-274', description: 'ORING', quantity: 1, unit: 'EA' },
  { partNumber: '6074-048', description: 'ORING', quantity: 1, unit: 'EA' },
  { partNumber: '6088-299', description: 'PAD, BRAKE ANCHOR KEY', quantity: 6, unit: 'EA' },
  { partNumber: '6088-890', description: 'ORING', quantity: 1, unit: 'EA' },
  { partNumber: '6131-460', description: 'DISC, FLEX DRIVE', quantity: 12, unit: 'EA' },
  { partNumber: '6131-747', description: 'FACING, CLUTCH', quantity: 12, unit: 'EA' },
  { partNumber: '6141-490', description: 'SEAL, PISTON', quantity: 1, unit: 'EA' },
  { partNumber: '6141-491', description: 'PISTON, CLUTCH', quantity: 1, unit: 'EA' },
  { partNumber: '6144-196', description: 'FACING, BRAKE', quantity: 24, unit: 'EA' },
  { partNumber: '7150-770', description: 'ORING', quantity: 1, unit: 'EA' },
  { partNumber: '8005-516', description: 'SEAL, OIL 1.000X1.250X.12', quantity: 1, unit: 'EA' },
  { partNumber: '8017-646', description: 'SEAL, OIL 6.500X8.000X.50', quantity: 2, unit: 'EA' },
  { partNumber: '8019-727', description: 'BLEEDER (SCHROEDER)', quantity: 1, unit: 'EA' },
  { partNumber: '8019-845', description: 'SPRING, COMP 1.00X2.00', quantity: 16, unit: 'EA' },
  { partNumber: '8020-001', description: 'SEAL, OIL 1.375X2.623X.31', quantity: 2, unit: 'EA' },
  { partNumber: '8024-186', description: 'BRG 130MM IDX 230MM OD', quantity: 2, unit: 'EA' },
];

export type SelectedPart = Part & { selected: boolean };
