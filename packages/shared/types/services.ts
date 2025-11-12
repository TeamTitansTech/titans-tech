/**
 * Shared Service Types
 * Used by both frontend and backend
 */

// Enums
export enum ServiceType {
  INSPECTION = 'INSPECTION',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum MatingPartType {
  BUSHING = 'BUSHING',
  CONNECTION = 'CONNECTION',
  NUT_SCREW_SLEEVE = 'NUT_SCREW_SLEEVE',
}

export enum ParallelismType {
  DNC = 'DNC',
  TO_BED = 'TO_BED',
  TO_BOLSTER = 'TO_BOLSTER',
}

export enum YesNoNaDncType {
  YES = 'YES',
  NO = 'NO',
  NA = 'NA',
  DNC = 'DNC',
}

export enum YesNoDncType {
  YES = 'YES',
  NO = 'NO',
  DNC = 'DNC',
}

export enum SystemType {
  LUBE = 'LUBE',
  HYD = 'HYD',
  MONITORFLOW = 'MONITORFLOW',
  PRESS_SW = 'PRESS_SW',
  GIB = 'GIB',
}

export enum PsiStatusType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  DAMAGED = 'DAMAGED',
}

// Bearing Clearance Data
export interface BearingClearanceData {
  totalClearance_RH: number;
  totalClearance_LH: number;
  mainBearings_RH: number;
  mainBearings_LH: number;
  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
  slideAdjNutToScrewSleeve_RH: number;
  slideAdjNutToScrewSleeve_LH: number;
  extraDoubleLockOpen_RH: number;
  extraDoubleLockOpen_LH: number;
  ballBoxArea_RH: number;
  ballBoxArea_LH: number;
  hasBeenAdjusted: boolean;
  combinedWith?: string;
  matingPart?: MatingPartType;
}

export interface BearingClearanceCheck {
  outerBefore?: BearingClearanceData;
  outerAfter?: BearingClearanceData;
  innerBefore?: BearingClearanceData;
  innerAfter?: BearingClearanceData;
}

// Slide Data
export interface SlideData {
  position1: number;
  position2: number;
  position3: number;
  position4: number;
  position5: number;
  position6: number;
}

export interface SlideCheck {
  outerBefore?: SlideData;
  outerData?: SlideData;
  innerBefore?: SlideData;
  innerData?: SlideData;
  parallelism?: ParallelismType;
  hasParallelismBeenAdjusted?: YesNoNaDncType;
  outerShutheightIndicatorsChecked?: YesNoDncType;
  outerOverloadsOnTonnageMonitor?: string;
  outerShutheightActualSh?: string;
  outerIndicatorReading?: string;
  innerShutheightIndicatorsChecked?: YesNoDncType;
  innerOverloadsOnTonnageMonitor?: string;
  innerShutheightActualSh?: string;
  innerIndicatorReading?: string;
  notes?: string;
}

// Gibs Data
export interface GibsData {
  hasBeenAdjusted: boolean;
  point1: number;
  point2: number;
  point3: number;
  point4: number;
  point5: number;
  point6: number;
  point7: number;
  point8: number;
  point9: number;
  point10: number;
  point11: number;
  point12: number;
  point13: number;
  point14: number;
  point15: number;
  point16: number;
  leftTop?: number;
  leftBottom?: number;
  rightTop?: number;
  rightBottom?: number;
  frontTop?: number;
  frontBottom?: number;
  backTop?: number;
  backBottom?: number;
  usable?: string;
}

export interface GibsCheck {
  outerBefore?: GibsData;
  outerAfter?: GibsData;
  innerBefore?: GibsData;
  innerAfter?: GibsData;
}

// Lubrication & Hydraulics Data
export interface LubricationHydraulicsGauge {
  id?: string;
  system: SystemType;
  gauge?: string;
  psi?: PsiStatusType;
}

export interface LubricationHydraulicsData {
  gauges: LubricationHydraulicsGauge[];
  changedOil: YesNoDncType;
  oilTemperatureF?: number;
  oilMfgType?: string;
  changedFilter: YesNoDncType;
  notes?: string;
}

// Clutch Data
export interface ClutchData {
  clutchType?: string;
  clutchLocation?: string;
  brakeSpringBrake?: number;
  brakeSpringClutch?: number;
  brakeSpringStudBolt?: string;
  brakeAnchorClearanceFB?: number;
  brakeAnchorClearanceFTB?: number;
  brakeAnchorClearanceRTB?: number;
  brakeStoppingTime?: number;
  brakeLining?: string;
  brakeClearing?: number;
  brakeClearanceTotal?: number;
  brakeClearanceRear?: number;
  flywheelStoppingTime?: number;
  flywheelBearings?: string;
  flywheelBrake?: string;
  clutchEngagements?: number;
  clutchLining?: string;
  clutchSeals?: string;
  gearBacklashBefore?: number;
  gearBacklashAfter?: number;
  crankEndplayBefore?: number;
  crankEndplayAfter?: number;
  airRegulatorPSI?: number;
  airClutchTravel?: number;
  airLineOilerSetting?: string;
  hydClutchClearanceTotal?: number;
  hydClutchClearanceRear?: number;
  hydraulicPressurePSI?: number;
  accumulatorPSI?: number;
  rotaryUnion?: string;
  splinesDriveRingDisc?: string;
  adjustingNutLockSecure?: string;
  separateBrakeSeals?: string;
  flexDisc?: string;
}

// Counterbalance Cylinder Data
export interface CounterbalanceCylinderData {
  counterbalanceType?: string;
  airbagPistonSeals?: string;
  airbagPistonSealsLeakLocation?: string;
  regulator?: string;
  gaugePSI?: number;
  pneumaticsPlumbing?: string;
  rodSeals?: string;
  rodBushing?: string;
  oilWick?: string;
}

// Service Creation Payload (for API requests)
export interface CreateServicePayload {
  machineId: string;
  date: string;
  type: ServiceType;
  status?: ServiceStatus; // Optional: defaults to PENDING in backend
  performedBy?: string;
  bearingClearance?: BearingClearanceCheck;
  slide?: SlideCheck;
  gibs?: GibsCheck;
  lubricationHydraulics?: LubricationHydraulicsData;
  clutch?: ClutchData;
  counterbalanceCylinder?: CounterbalanceCylinderData;
}

export interface UpdateServicePayload {
  date?: string;
  type?: ServiceType;
  status?: ServiceStatus;
  performedBy?: string;
  bearingClearance?: BearingClearanceCheck;
  slide?: SlideCheck;
  gibs?: GibsCheck;
  lubricationHydraulics?: LubricationHydraulicsData;
  clutch?: ClutchData;
  counterbalanceCylinder?: CounterbalanceCylinderData;
}

// Complete Service Entity
export interface Service {
  id: string;
  machineId: string;
  date: string;
  type: ServiceType;
  status: ServiceStatus;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Service History Item (for display)
export interface ServiceHistoryItem {
  id: string;
  type: string;
  technician: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
}

// Form Component Props Types
export interface BearingClearanceFormProps {
  data: BearingClearanceData;
  updateFn: (field: keyof BearingClearanceData, value: string | number | boolean) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof BearingClearanceData) => void;
  title: string;
}

export interface SlideFormProps {
  data: SlideData;
  updateFn: (field: keyof SlideData, value: number) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideData) => void;
  title: string;
}

export interface GibsFormProps {
  data: GibsData;
  updateFn: (field: keyof GibsData, value: string | number | boolean | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof GibsData) => void;
  title: string;
}

export interface LubricationHydraulicsFormProps {
  data: LubricationHydraulicsData;
  updateFn: (
    field: keyof LubricationHydraulicsData,
    value: string | number | boolean | YesNoDncType | LubricationHydraulicsGauge[] | undefined,
  ) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof LubricationHydraulicsData) => void;
}

export interface ClutchFormProps {
  data: ClutchData;
  updateFn: (field: keyof ClutchData, value: string | number | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof ClutchData) => void;
}

export interface CounterbalanceCylinderFormProps {
  data: CounterbalanceCylinderData;
  updateFn: (field: keyof CounterbalanceCylinderData, value: string | number | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof CounterbalanceCylinderData) => void;
  title: string;
}

export interface InspectionModalProps {
  machineId: string;
  blueprintSections: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ServiceCreationModalProps {
  machineId: string;
  blueprintSections: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
