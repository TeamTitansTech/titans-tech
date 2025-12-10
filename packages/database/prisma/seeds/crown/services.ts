import {
  PrismaClient,
  Machine,
  User,
  ServiceType,
  ServiceStatus,
  ServiceSection,
  AlertSeverity,
  YesNoNaDncType,
  YesNoDncType,
  MatingPartType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncDamagedType,
  ConditionOkNaDncBrokenLooseType,
  DriveBeltConditionType,
  ProtectiveCoversStatusType,
  FlywheelBearingsType,
  FlywheelBrakeType,
  RotaryUnionType,
  ClutchLiningType,
  ClutchSealsType,
  SeparateBrakeSealsType,
  FlexDiscType,
  BrakeSpringStudBoltType,
  BrakeLiningType,
  OkNaDncNotOperationalType,
  CylinderAirbagType,
  OkNaDncLeakingType,
  OkNaDncNeedReplacedType,
} from '../../../generated/prisma/client';

// ============================================================================
// INSPECTION DATA FROM: MINSTER PRESS EQUIPMENT INSPECTION DATABASE
// ============================================================================
// Date Range: 2017-2025 (8 years)
// Total Inspections: 7 (Crown only - Ardagh has templates only)
//
// CROWN COMPANY - 3 FACILITIES:
//
//   ARUMA (Estancia) - 3 inspections:
//     • #30645: Feb 24, 2022 | Sep 6, 2024 (2 inspections) - Flywheel noise
//     • #30530: Aug 1, 2024 (1 inspection) - Excellent condition
//
//   CROWN CORK & SEAL (Ponta Grossa) - 3 inspections:
//     • #30935: Jul 10, 2024 | May 15, 2025 (2 inspections) - Very good
//     • #30634: Jul 5, 2025 (1 inspection) - BEST IN FLEET (Gold Standard)
//
//   CROWN CORK (Teresina-PI) - 1 inspection:
//     • #30692: Jul 10, 2017 (1 inspection - OUTDATED) - Historical data
//
// STANDARD PRESSURE SPECIFICATIONS (All Units):
//   Lube Pump: 140 PSI | Hydraulic System: 1650 PSI | Counterbalance: 20 PSI
// ============================================================================

interface BearingMeasurement {
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
}

interface SlideMeasurement {
  parallelismPoint2: number;
  parallelismPoint3: number;
  tonnageMonitorReading: number;
  shutheightActual: string;
  position1: number;
  position2: number;
  position3: number;
  position4: number;
  position5: number;
}

interface ClutchMeasurement {
  brakeSpringBrake: number;
  brakeSpringStudBolt: BrakeSpringStudBoltType;
  brakeLining: BrakeLiningType;
  brakeAnchorFB: number;
  brakeAnchorFTB: number;
  brakeAnchorRTB: number;
  flywheelBearings: FlywheelBearingsType;
  flywheelBrake: FlywheelBrakeType;
  rotaryUnion: RotaryUnionType;
  clutchLining: ClutchLiningType;
  clutchSeals: ClutchSealsType;
  separateBrakeSeals: SeparateBrakeSealsType;
  flexDisc: FlexDiscType;
  hydClutchClearanceTotal: number;
  hydClutchClearanceRear: number;
  hydraulicPressure: number;
}

interface LubricationPressure {
  lubePumpPsi: number;
  hydraulicSystemPsi: number;
  counterbalancePsi: number;
}

interface CounterbalanceData {
  regulator: OkNaDncNotOperationalType;
  gauge: OkNaDncNotOperationalType;
  plumbing: OkNaDncNotOperationalType;
  pistonSeals: OkNaDncLeakingType;
  rodSeals: OkNaDncLeakingType;
  oilWick: OkNaDncNeedReplacedType;
}

interface ServiceData {
  id: string;
  date: Date;
  type: ServiceType;
  workOrderNumber: string;
  isPressLevel: YesNoNaDncType;
  driveBeltCondition: DriveBeltConditionType;
  areAllProtectiveCovers: ProtectiveCoversStatusType;
  isMainMotorSecure: YesNoDncType;
  isMotorPlateSecure: YesNoDncType;
  areCracksVisible: YesNoDncType;
  outerBefore: BearingMeasurement;
  outerData: BearingMeasurement;
  innerBefore: BearingMeasurement;
  innerData: BearingMeasurement;
  slideOuter: SlideMeasurement;
  slideInner: SlideMeasurement;
  clutch: ClutchMeasurement;
  lubrication: LubricationPressure;
  counterbalance: CounterbalanceData;
}

// Standard counterbalance data (same for all equipment)
const STANDARD_COUNTERBALANCE: CounterbalanceData = {
  regulator: OkNaDncNotOperationalType.OK,
  gauge: OkNaDncNotOperationalType.OK,
  plumbing: OkNaDncNotOperationalType.OK,
  pistonSeals: OkNaDncLeakingType.OK,
  rodSeals: OkNaDncLeakingType.OK,
  oilWick: OkNaDncNeedReplacedType.OK,
};

// Standard lubrication pressures (same for all equipment)
const STANDARD_LUBRICATION: LubricationPressure = {
  lubePumpPsi: 140,
  hydraulicSystemPsi: 1650,
  counterbalancePsi: 20,
};

// ============================================================================
// CROWN CORK SERVICES (#30935, #30634)
// ============================================================================

const crownServices30935: ServiceData[] = [
  {
    // #30935 - INSPECTION #1 - July 10, 2024
    id: 'crown-service-30935-2024-07-10',
    date: new Date('2024-07-10'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '7102024',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances - moderate wear, higher than Aruma's newer equipment
    outerBefore: {
      totalClearance_RH: 0.028,
      totalClearance_LH: 0.025,
      mainBearings_RH: 0.026,
      mainBearings_LH: 0.023,
      upperConnectionBearings_RH: 0.009,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.006,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.005,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.004,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    outerData: {
      totalClearance_RH: 0.028,
      totalClearance_LH: 0.025,
      mainBearings_RH: 0.026,
      mainBearings_LH: 0.023,
      upperConnectionBearings_RH: 0.009,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.006,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.005,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.004,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    innerBefore: {
      totalClearance_RH: 0.026,
      totalClearance_LH: 0.023,
      mainBearings_RH: 0.024,
      mainBearings_LH: 0.021,
      upperConnectionBearings_RH: 0.008,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerData: {
      totalClearance_RH: 0.026,
      totalClearance_LH: 0.023,
      mainBearings_RH: 0.024,
      mainBearings_LH: 0.021,
      upperConnectionBearings_RH: 0.008,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 22.15,
      shutheightActual: '28.125',
      position1: 0.005,
      position2: 0.006,
      position3: 0.006,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 22.15,
      shutheightActual: '28.125',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.058,
      brakeAnchorFTB: 0.015,
      brakeAnchorRTB: 0.015,
      flywheelBearings: FlywheelBearingsType.OK, // No flywheel issues
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.09,
      hydClutchClearanceRear: 0.022,
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
  {
    // #30935 - INSPECTION #2 - May 15, 2025 (10 months after previous)
    // Shows 7-9% bearing wear increase
    id: 'crown-service-30935-2025-05-15',
    date: new Date('2025-05-15'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '5152025',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances - increased ~8% over 10 months
    outerBefore: {
      totalClearance_RH: 0.03,
      totalClearance_LH: 0.027,
      mainBearings_RH: 0.028,
      mainBearings_LH: 0.025,
      upperConnectionBearings_RH: 0.01,
      upperConnectionBearings_LH: 0.009,
      wristPinToMatingPart_RH: 0.007,
      wristPinToMatingPart_LH: 0.006,
      wristPinToBushing_RH: 0.006,
      wristPinToBushing_LH: 0.005,
      slideAdjNutToScrewSleeve_RH: 0.005,
      slideAdjNutToScrewSleeve_LH: 0.004,
    },
    outerData: {
      totalClearance_RH: 0.03,
      totalClearance_LH: 0.027,
      mainBearings_RH: 0.028,
      mainBearings_LH: 0.025,
      upperConnectionBearings_RH: 0.01,
      upperConnectionBearings_LH: 0.009,
      wristPinToMatingPart_RH: 0.007,
      wristPinToMatingPart_LH: 0.006,
      wristPinToBushing_RH: 0.006,
      wristPinToBushing_LH: 0.005,
      slideAdjNutToScrewSleeve_RH: 0.005,
      slideAdjNutToScrewSleeve_LH: 0.004,
    },
    innerBefore: {
      totalClearance_RH: 0.028,
      totalClearance_LH: 0.025,
      mainBearings_RH: 0.026,
      mainBearings_LH: 0.023,
      upperConnectionBearings_RH: 0.009,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.006,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.005,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.004,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    innerData: {
      totalClearance_RH: 0.028,
      totalClearance_LH: 0.025,
      mainBearings_RH: 0.026,
      mainBearings_LH: 0.023,
      upperConnectionBearings_RH: 0.009,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.006,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.005,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.004,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: -0.001,
      tonnageMonitorReading: 22.18,
      shutheightActual: '28.05',
      position1: 0.005,
      position2: 0.005,
      position3: 0.005,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 22.18,
      shutheightActual: '28.05',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch - improved 10-22% after service
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.052, // Improved from 0.058
      brakeAnchorFTB: 0.012, // Improved from 0.015
      brakeAnchorRTB: 0.012, // Improved from 0.015
      flywheelBearings: FlywheelBearingsType.OK,
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.07, // Improved from 0.09
      hydClutchClearanceRear: 0.02, // Improved from 0.022
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
];

const crownServices30634: ServiceData[] = [
  {
    // #30634 - INSPECTION - July 5, 2025
    // OUTSTANDING - Best in fleet (lowest clearances)
    id: 'crown-service-30634-2025-07-05',
    date: new Date('2025-07-05'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '7052025',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances - LOWEST in fleet (excellent condition)
    outerBefore: {
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.019,
      mainBearings_RH: 0.02,
      mainBearings_LH: 0.018,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.005,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.003,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    outerData: {
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.019,
      mainBearings_RH: 0.02,
      mainBearings_LH: 0.018,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.005,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.003,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerBefore: {
      totalClearance_RH: 0.02,
      totalClearance_LH: 0.018,
      mainBearings_RH: 0.019,
      mainBearings_LH: 0.017,
      upperConnectionBearings_RH: 0.005,
      upperConnectionBearings_LH: 0.004,
      wristPinToMatingPart_RH: 0.003,
      wristPinToMatingPart_LH: 0.003,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.002,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.001,
    },
    innerData: {
      totalClearance_RH: 0.02,
      totalClearance_LH: 0.018,
      mainBearings_RH: 0.019,
      mainBearings_LH: 0.017,
      upperConnectionBearings_RH: 0.005,
      upperConnectionBearings_LH: 0.004,
      wristPinToMatingPart_RH: 0.003,
      wristPinToMatingPart_LH: 0.003,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.002,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.001,
    },
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 21.5,
      shutheightActual: '27.500',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 21.5,
      shutheightActual: '27.500',
      position1: 0.003,
      position2: 0.003,
      position3: 0.003,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch - TIGHTEST clearances in fleet
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.045, // Best in fleet
      brakeAnchorFTB: 0.011, // Best in fleet
      brakeAnchorRTB: 0.011, // Best in fleet
      flywheelBearings: FlywheelBearingsType.OK,
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.06, // Best in fleet
      hydClutchClearanceRear: 0.018, // Best in fleet
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
];

// ============================================================================
// ARUMA SERVICES (#30645, #30530)
// ============================================================================

const arumaServices30645: ServiceData[] = [
  {
    // #30645 - Work Order #22522 - February 24, 2022
    id: 'aruma-service-30645-2022-02-24',
    date: new Date('2022-02-24'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '22522',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances from document (Total Clearance #1 and #2)
    outerBefore: {
      totalClearance_RH: 0.019,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.02,
      mainBearings_LH: 0.017,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    outerData: {
      totalClearance_RH: 0.019,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.02,
      mainBearings_LH: 0.017,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerBefore: {
      totalClearance_RH: 0.018,
      totalClearance_LH: 0.02,
      mainBearings_RH: 0.019,
      mainBearings_LH: 0.016,
      upperConnectionBearings_RH: 0.005,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.003,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.002,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.001,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerData: {
      totalClearance_RH: 0.018,
      totalClearance_LH: 0.02,
      mainBearings_RH: 0.019,
      mainBearings_LH: 0.016,
      upperConnectionBearings_RH: 0.005,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.003,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.002,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.001,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 20.25,
      shutheightActual: '27.053',
      position1: 0.006,
      position2: 0.007,
      position3: 0.007,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 20.25,
      shutheightActual: '27.053',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.063,
      brakeAnchorFTB: 0.017,
      brakeAnchorRTB: 0.017,
      flywheelBearings: FlywheelBearingsType.NOISE, // ⚠️ Flywheel bearing noise
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.1,
      hydClutchClearanceRear: 0.024,
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
  {
    // #30645 - Work Order #9062024 - September 6, 2024 (30 months after previous)
    // Shows 38-63% bearing clearance increase over 2.5 years
    id: 'aruma-service-30645-2024-09-06',
    date: new Date('2024-09-06'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '9062024',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances - increased 38-63% from 2022
    outerBefore: {
      totalClearance_RH: 0.031,
      totalClearance_LH: 0.029,
      mainBearings_RH: 0.029,
      mainBearings_LH: 0.0275,
      upperConnectionBearings_RH: 0.012,
      upperConnectionBearings_LH: 0.014,
      wristPinToMatingPart_RH: 0.009,
      wristPinToMatingPart_LH: 0.011,
      wristPinToBushing_RH: 0.007,
      wristPinToBushing_LH: 0.008,
      slideAdjNutToScrewSleeve_RH: 0.006,
      slideAdjNutToScrewSleeve_LH: 0.007,
    },
    outerData: {
      totalClearance_RH: 0.031,
      totalClearance_LH: 0.029,
      mainBearings_RH: 0.029,
      mainBearings_LH: 0.0275,
      upperConnectionBearings_RH: 0.012,
      upperConnectionBearings_LH: 0.014,
      wristPinToMatingPart_RH: 0.009,
      wristPinToMatingPart_LH: 0.011,
      wristPinToBushing_RH: 0.007,
      wristPinToBushing_LH: 0.008,
      slideAdjNutToScrewSleeve_RH: 0.006,
      slideAdjNutToScrewSleeve_LH: 0.007,
    },
    innerBefore: {
      totalClearance_RH: 0.03,
      totalClearance_LH: 0.028,
      mainBearings_RH: 0.028,
      mainBearings_LH: 0.0265,
      upperConnectionBearings_RH: 0.011,
      upperConnectionBearings_LH: 0.013,
      wristPinToMatingPart_RH: 0.008,
      wristPinToMatingPart_LH: 0.01,
      wristPinToBushing_RH: 0.006,
      wristPinToBushing_LH: 0.007,
      slideAdjNutToScrewSleeve_RH: 0.005,
      slideAdjNutToScrewSleeve_LH: 0.006,
    },
    innerData: {
      totalClearance_RH: 0.03,
      totalClearance_LH: 0.028,
      mainBearings_RH: 0.028,
      mainBearings_LH: 0.0265,
      upperConnectionBearings_RH: 0.011,
      upperConnectionBearings_LH: 0.013,
      wristPinToMatingPart_RH: 0.008,
      wristPinToMatingPart_LH: 0.01,
      wristPinToBushing_RH: 0.006,
      wristPinToBushing_LH: 0.007,
      slideAdjNutToScrewSleeve_RH: 0.005,
      slideAdjNutToScrewSleeve_LH: 0.006,
    },
    slideOuter: {
      parallelismPoint2: -0.001,
      parallelismPoint3: -0.001,
      tonnageMonitorReading: 20.27,
      shutheightActual: '26.92',
      position1: 0.0025,
      position2: 0.0025,
      position3: 0.0025,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: -0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 20.27,
      shutheightActual: '26.92',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch - IMPROVED 47-50% after maintenance
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.055, // Improved from 0.063
      brakeAnchorFTB: 0.009, // Improved 47% from 0.017
      brakeAnchorRTB: 0.009, // Improved 47% from 0.017
      flywheelBearings: FlywheelBearingsType.NOISE, // ⚠️ Still has noise (persists from 2022)
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.05, // Improved 50% from 0.1
      hydClutchClearanceRear: 0.025,
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
];

const arumaServices30530: ServiceData[] = [
  {
    // #30530 - Work Order #80124 - August 1, 2024
    // Excellent condition - Similar to #30645's 2022 baseline, no flywheel issues
    id: 'aruma-service-30530-2024-08-01',
    date: new Date('2024-08-01'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '80124',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances - similar to #30645's 2022 baseline
    outerBefore: {
      totalClearance_RH: 0.023,
      totalClearance_LH: 0.022,
      mainBearings_RH: 0.022,
      mainBearings_LH: 0.02,
      upperConnectionBearings_RH: 0.007,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    outerData: {
      totalClearance_RH: 0.023,
      totalClearance_LH: 0.022,
      mainBearings_RH: 0.022,
      mainBearings_LH: 0.02,
      upperConnectionBearings_RH: 0.007,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerBefore: {
      totalClearance_RH: 0.022,
      totalClearance_LH: 0.02,
      mainBearings_RH: 0.021,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.005,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerData: {
      totalClearance_RH: 0.022,
      totalClearance_LH: 0.02,
      mainBearings_RH: 0.021,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.005,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 18.25,
      shutheightActual: '26.053',
      position1: 0.005,
      position2: 0.005,
      position3: 0.005,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 18.25,
      shutheightActual: '26.053',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch - slightly better than #30645, no flywheel issues
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.047,
      brakeAnchorFTB: 0.016,
      brakeAnchorRTB: 0.016,
      flywheelBearings: FlywheelBearingsType.OK, // ✓ No flywheel issues
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.08,
      hydClutchClearanceRear: 0.019,
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
];

// ============================================================================
// TERESINA SERVICES (#30692) - HISTORICAL 2017 DATA
// ============================================================================

const teresinaServices30692: ServiceData[] = [
  {
    // #30692 - TASK3064 - July 10, 2017
    // Historical data - INSPECTION OVERDUE (8 years since last inspection)
    id: 'crown-service-30692-2017-07-10',
    date: new Date('2017-07-10'),
    type: ServiceType.INSPECTION,
    workOrderNumber: 'TASK3064',
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances from 2017 - Grade A- (90/100)
    // Total #1: LH 0.021", RH 0.021" | Total #2: LH 0.026", RH 0.0265"
    outerBefore: {
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.019,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    outerData: {
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.019,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerBefore: {
      totalClearance_RH: 0.0265,
      totalClearance_LH: 0.026,
      mainBearings_RH: 0.024,
      mainBearings_LH: 0.024,
      upperConnectionBearings_RH: 0.008,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    innerData: {
      totalClearance_RH: 0.0265,
      totalClearance_LH: 0.026,
      mainBearings_RH: 0.024,
      mainBearings_LH: 0.024,
      upperConnectionBearings_RH: 0.008,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 20.25,
      shutheightActual: '27.36',
      position1: 0.005,
      position2: 0.005,
      position3: 0.005,
      position4: 0.0,
      position5: 0.0,
    },
    slideInner: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 20.25,
      shutheightActual: '27.36',
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch data from 2017
    // Brake Spring 1.574", F-B 0.063", F-TB 0.015", R-TB 0.013"
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.063,
      brakeAnchorFTB: 0.015,
      brakeAnchorRTB: 0.013,
      flywheelBearings: FlywheelBearingsType.OK, // ✓ No issues in 2017
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.085,
      hydClutchClearanceRear: 0.021,
      hydraulicPressure: 1650,
    },
    lubrication: STANDARD_LUBRICATION,
    counterbalance: STANDARD_COUNTERBALANCE,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createBearingClearanceData(
  prisma: PrismaClient,
  id: string,
  measurements: BearingMeasurement,
) {
  return prisma.bearingClearanceData.upsert({
    where: { id },
    update: {},
    create: {
      id,
      totalClearance_RH: measurements.totalClearance_RH,
      totalClearance_LH: measurements.totalClearance_LH,
      mainBearings_RH: measurements.mainBearings_RH,
      mainBearings_LH: measurements.mainBearings_LH,
      upperConnectionBearings_RH: measurements.upperConnectionBearings_RH,
      upperConnectionBearings_LH: measurements.upperConnectionBearings_LH,
      wristPinToMatingPart_RH: measurements.wristPinToMatingPart_RH,
      wristPinToMatingPart_LH: measurements.wristPinToMatingPart_LH,
      wristPinToBushing_RH: measurements.wristPinToBushing_RH,
      wristPinToBushing_LH: measurements.wristPinToBushing_LH,
      slideAdjNutToScrewSleeve_RH: measurements.slideAdjNutToScrewSleeve_RH,
      slideAdjNutToScrewSleeve_LH: measurements.slideAdjNutToScrewSleeve_LH,
      extraDoubleLockOpen_RH: 0,
      extraDoubleLockOpen_LH: 0,
      ballBoxArea_RH: 0,
      ballBoxArea_LH: 0,
      hasBeenAdjusted: YesNoNaDncType.NO,
      matingPart: MatingPartType.BUSHING,
      slideMotorMounts: ConditionOkNaDncBrokenWornType.OK,
      powerCordHoses: ConditionOkNaDncDamagedType.OK,
      chainsGearsSprockets: ConditionOkNaDncBrokenLooseType.OK,
      lockingClamps: ConditionOkNaDncDamagedType.OK,
    },
  });
}

async function createSlideDoubleHammerData(
  prisma: PrismaClient,
  id: string,
  measurements: SlideMeasurement,
) {
  return prisma.slideDoubleHammerData.upsert({
    where: { id },
    update: {},
    create: {
      id,
      hasParallelismBeenAdjusted: YesNoNaDncType.NO,
      shutheightActualSh: measurements.shutheightActual,
      overloadsOnTonnageMonitor: measurements.tonnageMonitorReading.toString(),
      position1: measurements.position1,
      position2: measurements.position2,
      position3: measurements.position3,
      position4: measurements.position4,
      position5: measurements.position5,
    },
  });
}

async function createClutchData(prisma: PrismaClient, id: string, clutch: ClutchMeasurement) {
  return prisma.clutchData.upsert({
    where: { id },
    update: {},
    create: {
      id,
      brakeSpringBrake: clutch.brakeSpringBrake,
      brakeSpringStudBolt: clutch.brakeSpringStudBolt,
      brakeLining: clutch.brakeLining,
      brakeSpringFB: clutch.brakeAnchorFB,
      brakeSpringFTB: clutch.brakeAnchorFTB,
      brakeSpringRTB: clutch.brakeAnchorRTB,
      flywheelBearings: clutch.flywheelBearings,
      flywheelBrake: clutch.flywheelBrake,
      rotaryUnion: clutch.rotaryUnion,
      clutchLining: clutch.clutchLining,
      clutchSeals: clutch.clutchSeals,
      separateBrakeSeals: clutch.separateBrakeSeals,
      flexDisc: clutch.flexDisc,
      hydClutchClearanceTotal: clutch.hydClutchClearanceTotal,
      hydClutchClearanceRear: clutch.hydClutchClearanceRear,
      hydraulicPressureValue: clutch.hydraulicPressure,
    },
  });
}

async function createCounterbalanceData(
  prisma: PrismaClient,
  id: string,
  data: CounterbalanceData,
) {
  return prisma.counterbalanceCylinderAirbagData.upsert({
    where: { id },
    update: {},
    create: {
      id,
      counterbalanceType: CylinderAirbagType.CYLINDER,
      regulator: data.regulator,
      gauge: data.gauge,
      pneumaticsPlumbing: data.plumbing,
      airbagPistonSeals: data.pistonSeals,
      rodSeals: data.rodSeals,
      oilWick: data.oilWick,
    },
  });
}

function calculateAlertSeverity(
  lh: number,
  rh: number,
  greenMin: number,
  yellowMin: number,
  redMin: number,
): AlertSeverity {
  const differential = Math.abs(lh - rh);
  if (differential >= redMin) return AlertSeverity.RED;
  if (differential >= yellowMin) return AlertSeverity.YELLOW;
  return AlertSeverity.GREEN;
}

function calculateClutchAlertSeverity(
  value: number,
  greenMin: number,
  yellowMin: number,
  redMin: number,
): AlertSeverity {
  if (value >= redMin) return AlertSeverity.RED;
  if (value >= yellowMin) return AlertSeverity.YELLOW;
  return AlertSeverity.GREEN;
}

// ============================================================================
// MAIN SERVICE CREATION FUNCTION
// ============================================================================

async function createServiceWithData(
  prisma: PrismaClient,
  serviceData: ServiceData,
  machine: Machine,
  technician: User,
) {
  const completedSections = [
    ServiceSection.BEARING_CLEARANCE,
    ServiceSection.SLIDE_DOUBLE_HAMMER,
    ServiceSection.CLUTCH,
    ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
    ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
  ];

  // Create the main service record
  const service = await prisma.machineService.upsert({
    where: { id: serviceData.id },
    update: {},
    create: {
      id: serviceData.id,
      machineId: machine.id,
      date: serviceData.date,
      type: serviceData.type,
      status: ServiceStatus.COMPLETED,
      performedBy: technician.id,
      completedSections: JSON.stringify(completedSections),
      selectedSections: JSON.stringify(completedSections),
      currentStep: 'summary',
      isPressLevel: serviceData.isPressLevel,
      driveBeltCondition: serviceData.driveBeltCondition,
      areAllProtectiveCovers: serviceData.areAllProtectiveCovers,
      isMainMotorSecure: serviceData.isMainMotorSecure,
      isMotorPlateSecure: serviceData.isMotorPlateSecure,
      areCracksVisible: serviceData.areCracksVisible,
    },
  });

  console.log(
    `  ✓ WO #${serviceData.workOrderNumber} (${serviceData.date.toISOString().split('T')[0]})`,
  );

  // BEARING CLEARANCE
  const outerBeforeData = await createBearingClearanceData(
    prisma,
    `${serviceData.id}-outer-before`,
    serviceData.outerBefore,
  );
  const outerDataRecord = await createBearingClearanceData(
    prisma,
    `${serviceData.id}-outer-data`,
    serviceData.outerData,
  );
  const innerBeforeData = await createBearingClearanceData(
    prisma,
    `${serviceData.id}-inner-before`,
    serviceData.innerBefore,
  );
  const innerDataRecord = await createBearingClearanceData(
    prisma,
    `${serviceData.id}-inner-data`,
    serviceData.innerData,
  );

  await prisma.machineServiceBearingClearance.upsert({
    where: { id: `${serviceData.id}-bearing-clearance` },
    update: {},
    create: {
      id: `${serviceData.id}-bearing-clearance`,
      machineServiceId: service.id,
      outerBeforeId: outerBeforeData.id,
      outerDataId: outerDataRecord.id,
      innerBeforeId: innerBeforeData.id,
      innerDataId: innerDataRecord.id,
    },
  });

  // AlertBearingClearance
  const outerTotalDiff = Math.abs(
    serviceData.outerData.totalClearance_LH - serviceData.outerData.totalClearance_RH,
  );
  const innerTotalDiff = Math.abs(
    serviceData.innerData.totalClearance_LH - serviceData.innerData.totalClearance_RH,
  );

  await prisma.alertBearingClearance.create({
    data: {
      machineServiceId: service.id,
      outer_totalClearance_differential: outerTotalDiff,
      outer_totalClearance_severity: calculateAlertSeverity(
        serviceData.outerData.totalClearance_LH,
        serviceData.outerData.totalClearance_RH,
        0.015,
        0.025,
        0.035,
      ),
      outer_mainBearings_differential: Math.abs(
        serviceData.outerData.mainBearings_LH - serviceData.outerData.mainBearings_RH,
      ),
      outer_mainBearings_severity: AlertSeverity.GREEN,
      outer_upperConnectionBearings_differential: Math.abs(
        serviceData.outerData.upperConnectionBearings_LH -
          serviceData.outerData.upperConnectionBearings_RH,
      ),
      outer_upperConnectionBearings_severity: AlertSeverity.GREEN,
      outer_wristPinToMatingPart_differential: Math.abs(
        serviceData.outerData.wristPinToMatingPart_LH -
          serviceData.outerData.wristPinToMatingPart_RH,
      ),
      outer_wristPinToMatingPart_severity: AlertSeverity.GREEN,
      outer_wristPinToBushing_differential: Math.abs(
        serviceData.outerData.wristPinToBushing_LH - serviceData.outerData.wristPinToBushing_RH,
      ),
      outer_wristPinToBushing_severity: AlertSeverity.GREEN,
      outer_slideAdjNutToScrewSleeve_differential: Math.abs(
        serviceData.outerData.slideAdjNutToScrewSleeve_LH -
          serviceData.outerData.slideAdjNutToScrewSleeve_RH,
      ),
      outer_slideAdjNutToScrewSleeve_severity: AlertSeverity.GREEN,
      inner_totalClearance_differential: innerTotalDiff,
      inner_totalClearance_severity: calculateAlertSeverity(
        serviceData.innerData.totalClearance_LH,
        serviceData.innerData.totalClearance_RH,
        0.015,
        0.025,
        0.035,
      ),
      inner_mainBearings_differential: Math.abs(
        serviceData.innerData.mainBearings_LH - serviceData.innerData.mainBearings_RH,
      ),
      inner_mainBearings_severity: AlertSeverity.GREEN,
      inner_upperConnectionBearings_differential: Math.abs(
        serviceData.innerData.upperConnectionBearings_LH -
          serviceData.innerData.upperConnectionBearings_RH,
      ),
      inner_upperConnectionBearings_severity: AlertSeverity.GREEN,
      inner_wristPinToMatingPart_differential: Math.abs(
        serviceData.innerData.wristPinToMatingPart_LH -
          serviceData.innerData.wristPinToMatingPart_RH,
      ),
      inner_wristPinToMatingPart_severity: AlertSeverity.GREEN,
      inner_wristPinToBushing_differential: Math.abs(
        serviceData.innerData.wristPinToBushing_LH - serviceData.innerData.wristPinToBushing_RH,
      ),
      inner_wristPinToBushing_severity: AlertSeverity.GREEN,
      inner_slideAdjNutToScrewSleeve_differential: Math.abs(
        serviceData.innerData.slideAdjNutToScrewSleeve_LH -
          serviceData.innerData.slideAdjNutToScrewSleeve_RH,
      ),
      inner_slideAdjNutToScrewSleeve_severity: AlertSeverity.GREEN,
      thresholdSnapshot: {
        totalClearance_greenMin: 0.015,
        totalClearance_yellowMin: 0.025,
        totalClearance_redMin: 0.035,
      },
    },
  });
  console.log('  ✓ Created bearing clearance data and alerts');

  // SLIDE (Double Hammer)
  const slideOuterData = await createSlideDoubleHammerData(
    prisma,
    `${serviceData.id}-slide-outer`,
    serviceData.slideOuter,
  );
  const slideInnerData = await createSlideDoubleHammerData(
    prisma,
    `${serviceData.id}-slide-inner`,
    serviceData.slideInner,
  );

  await prisma.machineServiceSlideDoubleHammer.upsert({
    where: { id: `${serviceData.id}-slide` },
    update: {},
    create: {
      id: `${serviceData.id}-slide`,
      machineServiceId: service.id,
      outerDataId: slideOuterData.id,
      innerDataId: slideInnerData.id,
    },
  });

  // Create AlertSlideDoubleHammer
  await prisma.alertSlideDoubleHammer.create({
    data: {
      machineServiceId: service.id,
      maxDeviationOuter_differential: Math.max(
        ...Object.values(serviceData.slideOuter).filter((v) => typeof v === 'number'),
      ) as number,
      maxDeviationOuter_severity: AlertSeverity.GREEN,
      maxDeviationInner_differential: Math.max(
        ...Object.values(serviceData.slideInner).filter((v) => typeof v === 'number'),
      ) as number,
      maxDeviationInner_severity: AlertSeverity.GREEN,
      thresholdSnapshot: {
        maxDeviation_greenMin: 0.002,
        maxDeviation_yellowMin: 0.005,
        maxDeviation_redMin: 0.01,
      },
    },
  });
  console.log('  ✓ Created slide (double hammer) data and alerts');

  // CLUTCH
  const clutchData = await createClutchData(
    prisma,
    `${serviceData.id}-clutch-data`,
    serviceData.clutch,
  );

  await prisma.machineServiceClutch.upsert({
    where: { id: `${serviceData.id}-clutch` },
    update: {},
    create: {
      id: `${serviceData.id}-clutch`,
      machineServiceId: service.id,
      dataId: clutchData.id,
    },
  });

  // Create AlertClutch
  await prisma.alertClutch.create({
    data: {
      machineServiceId: service.id,
      hydClutchClearanceTotal_value: serviceData.clutch.hydClutchClearanceTotal,
      hydClutchClearanceTotal_severity: calculateClutchAlertSeverity(
        serviceData.clutch.hydClutchClearanceTotal,
        0.05,
        0.08,
        0.12,
      ),
      hydClutchClearanceRear_value: serviceData.clutch.hydClutchClearanceRear,
      hydClutchClearanceRear_severity: AlertSeverity.GREEN,
      fb_value: serviceData.clutch.brakeAnchorFB,
      fb_severity: calculateClutchAlertSeverity(serviceData.clutch.brakeAnchorFB, 0.04, 0.06, 0.08),
      fTB_value: serviceData.clutch.brakeAnchorFTB,
      fTB_severity: AlertSeverity.GREEN,
      rTB_value: serviceData.clutch.brakeAnchorRTB,
      rTB_severity: AlertSeverity.GREEN,
      thresholdSnapshot: {
        hydClutchClearanceTotal_greenMin: 0.05,
        hydClutchClearanceTotal_yellowMin: 0.08,
        hydClutchClearanceTotal_redMin: 0.12,
        fb_greenMin: 0.04,
        fb_yellowMin: 0.06,
        fb_redMin: 0.08,
      },
    },
  });
  console.log('  ✓ Created clutch data and alerts');

  // LUBRICATION
  const lubricationData = await prisma.lubricationHydraulicsData.upsert({
    where: { id: `${serviceData.id}-lubrication-data` },
    update: {},
    create: {
      id: `${serviceData.id}-lubrication-data`,
      changedOil: YesNoDncType.DNC,
      changedFilter: YesNoDncType.DNC,
    },
  });

  await prisma.machineServiceLubricationHydraulics.upsert({
    where: { id: `${serviceData.id}-lubrication` },
    update: {},
    create: {
      id: `${serviceData.id}-lubrication`,
      machineServiceId: service.id,
      dataId: lubricationData.id,
    },
  });

  // COUNTERBALANCE
  const counterbalanceDataOuter = await createCounterbalanceData(
    prisma,
    `${serviceData.id}-counterbalance-outer`,
    serviceData.counterbalance,
  );

  await prisma.machineServiceCounterbalanceCylinderAirbag.upsert({
    where: { id: `${serviceData.id}-counterbalance` },
    update: {},
    create: {
      id: `${serviceData.id}-counterbalance`,
      machineServiceId: service.id,
      outerDataId: counterbalanceDataOuter.id,
    },
  });

  return service;
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Seed Crown Cork & Seal services (Ponta Grossa) - Crown Branch
 * Equipment: #30935 (2 inspections), #30634 (1 inspection)
 */
export async function seedCrownServices(
  prisma: PrismaClient,
  machine30935: Machine,
  machine30634: Machine,
  technician: User,
) {
  console.log('Creating Crown Cork services...');

  // #30935 services (2 inspections with trend data)
  console.log(`\n  ${machine30935.name}:`);
  for (const serviceData of crownServices30935) {
    await createServiceWithData(prisma, serviceData, machine30935, technician);
  }

  // #30634 services (1 inspection - best in fleet)
  console.log(`\n  ${machine30634.name}:`);
  for (const serviceData of crownServices30634) {
    await createServiceWithData(prisma, serviceData, machine30634, technician);
  }

  console.log(
    `\n✓ Created ${crownServices30935.length + crownServices30634.length} Crown Cork inspections`,
  );
}

/**
 * Seed Aruma services (Estância) - Crown Branch
 * Equipment: #30645 (2 inspections), #30530 (1 inspection)
 */
export async function seedArumaServices(
  prisma: PrismaClient,
  machine30645: Machine,
  machine30530: Machine,
  technician: User,
) {
  console.log('Creating Aruma (Estancia) services...');

  // #30645 services (2 inspections with trend data)
  console.log(`\n  ${machine30645.name}:`);
  for (const serviceData of arumaServices30645) {
    await createServiceWithData(prisma, serviceData, machine30645, technician);
  }

  // #30530 services (1 inspection)
  console.log(`\n  ${machine30530.name}:`);
  for (const serviceData of arumaServices30530) {
    await createServiceWithData(prisma, serviceData, machine30530, technician);
  }

  console.log(
    `\n✓ Created ${arumaServices30645.length + arumaServices30530.length} Aruma (Estancia) inspections`,
  );
}

/**
 * Seed Teresina services (Teresina-PI) - Crown Branch
 * Equipment: #30692 (1 inspection - 2017 OUTDATED)
 */
export async function seedTeresinaServices(
  prisma: PrismaClient,
  machine30692: Machine,
  technician: User,
) {
  console.log('Creating Teresina (Teresina-PI) services...');

  // #30692 services (1 inspection - 2017 historical data)
  console.log(`\n  ${machine30692.name}:`);
  for (const serviceData of teresinaServices30692) {
    await createServiceWithData(prisma, serviceData, machine30692, technician);
  }

  console.log(`\n✓ Created ${teresinaServices30692.length} Teresina inspection (2017 - OUTDATED)`);
}

// Legacy export for backwards compatibility
export { createServiceWithData };
