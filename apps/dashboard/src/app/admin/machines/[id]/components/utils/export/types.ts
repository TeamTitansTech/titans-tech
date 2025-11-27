import { type Service } from '@/data/types/services.types';

// Type definitions for section data structures
export interface BearingMeasurements extends Record<string, unknown> {
  hasBeenAdjusted?: boolean;
  combinedWith?: string;
  matingPart?: string;
  slideMotorMounts?: string;
  powerCordHoses?: string;
  chainsGearsSprockets?: string;
  lockingClamps?: string;
  notes?: string;
}

export interface SlidePositionData extends Record<string, unknown> {
  position1?: number;
  position2?: number;
  position3?: number;
  position4?: number;
  position5?: number;
  position6?: number;
}

export interface BearingClearanceSectionData {
  outerBefore?: BearingMeasurements;
  innerBefore?: BearingMeasurements;
  outerData?: BearingMeasurements;
  innerData?: BearingMeasurements;
}

export interface SlideData {
  parallelism?: string;
  hasParallelismBeenAdjusted?: string;
  shutheightIndicatorsChecked?: string;
  overloadsOnTonnageMonitor?: string;
  shutheightActualSh?: number;
  indicatorReading?: number;
  beforePosition1?: number;
  beforePosition2?: number;
  beforePosition3?: number;
  beforePosition4?: number;
  beforePosition5?: number;
  afterPosition1?: number;
  afterPosition2?: number;
  afterPosition3?: number;
  afterPosition4?: number;
  afterPosition5?: number;
}

export interface SlideSectionData {
  outerData?: SlideData;
  innerData?: SlideData;
  notes?: string;
}

export interface GibsStageData {
  point1?: number;
  point2?: number;
  point3?: number;
  point4?: number;
  point5?: number;
  point6?: number;
  point7?: number;
  point8?: number;
  point9?: number;
  point10?: number;
  point11?: number;
  point12?: number;
  point13?: number;
  point14?: number;
  point15?: number;
  point16?: number;
}

export interface GibsSectionData {
  outerBefore?: GibsStageData;
  outerData?: GibsStageData;
  outerFreeHangingData?: GibsStageData;
  innerBefore?: GibsStageData;
  innerData?: GibsStageData;
  innerBeforeTool?: GibsStageData;
  innerDataTool?: GibsStageData;
  haveInnerGibsBeenAdjusted?: string;
  notes?: string;
}

export interface GaugeData {
  system?: unknown;
  gaugeSwitchIdentifier?: unknown;
  psi?: unknown;
}

export interface LubricationSectionData extends Record<string, unknown> {
  changedOil?: string;
  oilTemperature?: number;
  oilMfgType?: string;
  changedFilter?: string;
  gauges?: GaugeData[];
}

export interface ClutchSectionData extends Record<string, unknown> {
  clutchType?: string;
  clutchLocation?: string;
  brakeSpringBrake?: string;
  brakeSpringClutch?: string;
  brakeSpringFB?: string;
  brakeSpringFTB?: string;
  brakeSpringRTB?: string;
  brakeSpringStudBolt?: string;
  brakeStoppingTime?: number;
  brakeLining?: string;
  brakeClearing?: string;
  brakeClearanceTotal?: number;
  brakeClearanceRear?: number;
  flywheelStoppingTime?: number;
  flywheelBearings?: string;
  flywheelBrake?: string;
  rotaryUnion?: string;
  clutchEngagements?: string;
  clutchLining?: string;
  clutchSeals?: string;
  separateBrakeSeals?: string;
  flexDisc?: string;
  splinesDriveRingDisc?: string;
  adjustingNutLockSecure?: string;
  gearBacklashBefore?: number;
  gearBacklashAfter?: number;
  crankEndplayBefore?: number;
  crankEndplayAfter?: number;
  airRegulatorValue?: number;
  airRegulatorUnit?: string;
  airClutchTravel?: string;
  airLineOilerSetting?: string;
  hydClutchClearanceTotal?: number;
  hydClutchClearanceRear?: number;
  hydraulicPressureValue?: number;
  hydraulicPressureUnit?: string;
  accumulatorValue?: number;
  accumulatorUnit?: string;
  notes?: string;
}

export interface CounterbalanceData extends Record<string, unknown> {
  counterbalanceType?: string;
  airbagPistonSeals?: string;
  airbagPistonSealsLeakLocation?: string;
  regulator?: string;
  gauge?: string;
  pneumaticsPlumbing?: string;
  rodSeals?: string;
  rodBushing?: string;
  oilWick?: string;
}

export interface CounterbalanceSectionData {
  outerData?: CounterbalanceData;
  innerData?: CounterbalanceData;
  notes?: string;
}

// Tramming measurement data (matches Prisma TrammingData model)
export interface TrammingData extends Record<string, unknown> {
  // Top Position
  topTop?: number;
  topBottom?: number;
  topLeft?: number;
  topRight?: number;
  // Bottom Position
  bottomTop?: number;
  bottomBottom?: number;
  bottomLeft?: number;
  bottomRight?: number;
  // Left Position
  leftTop?: number;
  leftBottom?: number;
  leftLeft?: number;
  leftRight?: number;
  // Right Position
  rightTop?: number;
  rightBottom?: number;
  rightLeft?: number;
  rightRight?: number;
}

export interface TrammingSectionData {
  slideTram?: string;
  unit?: string;
  outerData?: TrammingData;
  innerData?: TrammingData;
  notes?: string;
}

// Pistons measurement data (matches Prisma PistonsData model)
export interface PistonsData extends Record<string, unknown> {
  // LH Piston
  lhTop?: number;
  lhBottom?: number;
  lhLeft?: number;
  lhRight?: number;
  // RH Piston
  rhTop?: number;
  rhBottom?: number;
  rhLeft?: number;
  rhRight?: number;
}

export interface PistonsSectionData {
  guideSeals?: string;
  pistonSeals?: string;
  vacuumSystem?: string;
  vacuumSystemAirPressureSetting?: number;
  vacuumSystemAirPressureUnit?: string;
  unit?: string;
  outerData?: PistonsData;
  innerData?: PistonsData;
  notes?: string;
}

// Translation callbacks interface
export interface TranslationCallbacks {
  getSectionName: (key: string) => string;
  getServiceTypeName: () => string;
  getTableTranslation: (key: string) => string;
  getBearingFieldTranslation: (key: string) => string;
  getSlideFieldTranslation: (key: string) => string;
  getGibsFieldTranslation: (key: string) => string;
  getLubricationFieldTranslation: (key: string) => string;
  getClutchFieldTranslation: (key: string) => string;
  getClutchSectionTranslation: (key: string) => string;
  getCounterbalanceFieldTranslation: (key: string) => string;
  getTrammingFieldTranslation: (key: string) => string;
  getPistonsFieldTranslation: (key: string) => string;
  getServiceTranslation: (key: string) => string;
  getCommonStatusTranslation: (key: string) => string;
  getMeasurementsTranslation: (key: string) => string;
  getInspectionEnumTranslation: (enumType: string, value: string) => string;
}

export interface ExportData {
  service: Service;
  completedSections: string[];
  completedSectionData: Record<string, Record<string, unknown>>;
  sectionRegistry: Record<string, unknown>;
  translationCallbacks?: TranslationCallbacks;
}

// PDF-specific types
export interface PDFRenderContext {
  doc: import('jspdf').jsPDF;
  yPosition: number;
  margin: number;
  contentWidth: number;
  primaryColor: [number, number, number];
  translationCallbacks: TranslationCallbacks;
  checkPageBreak: (requiredSpace: number) => void;
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string };
}
