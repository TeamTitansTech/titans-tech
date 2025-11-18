/**
 * Bearing Clearance Field Names
 * Shared between backend calculations and frontend display
 */

/**
 * The 6 monitored bearing clearance fields
 */
export type BearingFieldName =
  | 'totalClearance'
  | 'mainBearings'
  | 'upperConnectionBearings'
  | 'wristPinToMatingPart'
  | 'wristPinToBushing'
  | 'slideAdjNutToScrewSleeve';

/**
 * All bearing clearance fields
 */
export const BEARING_FIELD_NAMES: readonly BearingFieldName[] = [
  'totalClearance',
  'mainBearings',
  'upperConnectionBearings',
  'wristPinToMatingPart',
  'wristPinToBushing',
  'slideAdjNutToScrewSleeve',
] as const;

/**
 * Portuguese translations for bearing field names
 */
export const BEARING_FIELD_LABELS: Record<BearingFieldName, string> = {
  totalClearance: 'Folga Total',
  mainBearings: 'Mancais Principais',
  upperConnectionBearings: 'Mancais de Conexão Superior',
  wristPinToMatingPart: 'Pino do Punho para Peça de Acoplamento',
  wristPinToBushing: 'Pino do Punho para Bucha',
  slideAdjNutToScrewSleeve: 'Porca de Ajuste do Slide para Luva do Parafuso',
};

/**
 * Type for RH/LH field keys (e.g., "totalClearance_RH")
 */
export type BearingMeasurementKey = `${BearingFieldName}_${'RH' | 'LH'}`;

/**
 * Type for differential field keys (e.g., "totalClearance_differential")
 */
export type BearingDifferentialKey = `${BearingFieldName}_differential`;

/**
 * Type for severity field keys (e.g., "totalClearance_severity")
 */
export type BearingSeverityKey = `${BearingFieldName}_severity`;
