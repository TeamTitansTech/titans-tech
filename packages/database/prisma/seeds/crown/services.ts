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
// DATA FROM: COMPLETE PRESS INSPECTION DATA - MASTER DOCUMENT
// Equipment: Minster DAC Serial #30645
// Customer: Aruma Produtora De Embalagens (mapped to Crown)
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
  // 5 position measurements (outer slide free hanging)
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
  // Observation fields
  isPressLevel: YesNoNaDncType;
  driveBeltCondition: DriveBeltConditionType;
  areAllProtectiveCovers: ProtectiveCoversStatusType;
  isMainMotorSecure: YesNoDncType;
  isMotorPlateSecure: YesNoDncType;
  areCracksVisible: YesNoDncType;
  // Bearing measurements
  outerBefore: BearingMeasurement;
  outerData: BearingMeasurement;
  innerBefore: BearingMeasurement;
  innerData: BearingMeasurement;
  // Slide measurements
  slideOuter: SlideMeasurement;
  slideInner: SlideMeasurement;
  // Clutch measurements
  clutch: ClutchMeasurement;
  // Lubrication/Hydraulics pressures
  lubrication: LubricationPressure;
  // Counterbalance data
  counterbalance: CounterbalanceData;
}

// Two actual work orders from the comprehensive document
const actualWorkOrders: ServiceData[] = [
  {
    // Work Order #22522 - February 24, 2022
    id: 'crown-service-2022-02-24',
    date: new Date('2022-02-24'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '22522',
    // Inspection checks
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
    // Slide measurements from document
    slideOuter: {
      parallelismPoint2: 0.001,
      parallelismPoint3: 0.001,
      tonnageMonitorReading: 20.25,
      shutheightActual: '27.053',
      // Outer slide free hanging measurements
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
      // Inner slide measurements
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch measurements from document
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.063,
      brakeAnchorFTB: 0.017,
      brakeAnchorRTB: 0.017,
      flywheelBearings: FlywheelBearingsType.NOISE, // Document notes: Noise ⚠️
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
    // Lubrication/Hydraulics pressures from document
    lubrication: {
      lubePumpPsi: 140,
      hydraulicSystemPsi: 1650,
      counterbalancePsi: 20,
    },
    // Counterbalance/Pneumatics from document
    counterbalance: {
      regulator: OkNaDncNotOperationalType.OK,
      gauge: OkNaDncNotOperationalType.OK,
      plumbing: OkNaDncNotOperationalType.OK,
      pistonSeals: OkNaDncLeakingType.OK,
      rodSeals: OkNaDncLeakingType.OK,
      oilWick: OkNaDncNeedReplacedType.OK,
    },
  },
  {
    // Work Order #9062024 - September 6, 2024
    id: 'crown-service-2024-09-06',
    date: new Date('2024-09-06'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '9062024',
    // Inspection checks
    isPressLevel: YesNoNaDncType.YES,
    driveBeltCondition: DriveBeltConditionType.OK,
    areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    // Bearing clearances from document (increased values showing wear)
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
    // Slide measurements from document (2024)
    slideOuter: {
      parallelismPoint2: -0.001,
      parallelismPoint3: -0.001,
      tonnageMonitorReading: 20.27,
      shutheightActual: '26.92',
      // Outer slide free hanging measurements (improved after maintenance)
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
      // Inner slide measurements
      position1: 0.004,
      position2: 0.004,
      position3: 0.004,
      position4: 0.0,
      position5: 0.0,
    },
    // Clutch measurements from document (improved after maintenance)
    clutch: {
      brakeSpringBrake: 1.574,
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeAnchorFB: 0.055, // Improved from 0.063
      brakeAnchorFTB: 0.009, // Improved from 0.017
      brakeAnchorRTB: 0.009, // Improved from 0.017
      flywheelBearings: FlywheelBearingsType.NOISE, // Still has noise
      flywheelBrake: FlywheelBrakeType.OK,
      rotaryUnion: RotaryUnionType.OK,
      clutchLining: ClutchLiningType.OK,
      clutchSeals: ClutchSealsType.OK,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: 0.05, // Improved from 0.1
      hydClutchClearanceRear: 0.025,
      hydraulicPressure: 1650,
    },
    // Lubrication/Hydraulics pressures (stable - same as 2022)
    lubrication: {
      lubePumpPsi: 140,
      hydraulicSystemPsi: 1650,
      counterbalancePsi: 20,
    },
    // Counterbalance/Pneumatics (same as 2022)
    counterbalance: {
      regulator: OkNaDncNotOperationalType.OK,
      gauge: OkNaDncNotOperationalType.OK,
      plumbing: OkNaDncNotOperationalType.OK,
      pistonSeals: OkNaDncLeakingType.OK,
      rodSeals: OkNaDncLeakingType.OK,
      oilWick: OkNaDncNeedReplacedType.OK,
    },
  },
];

// Helper function to create BearingClearanceData
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

// Helper function to create SlideData
async function createSlideData(prisma: PrismaClient, id: string, measurements: SlideMeasurement) {
  return prisma.slideData.upsert({
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

// Helper function to create ClutchData
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

// Helper function to create CounterbalanceCylinderAirbagData
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

// Helper function to calculate alert severity based on differential
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

// Helper function to calculate clutch alert severity based on value
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

export async function seedCrownServices(prisma: PrismaClient, machine: Machine, technician: User) {
  console.log('Creating Crown services with comprehensive inspection data...');

  const completedSections = [
    ServiceSection.BEARING_CLEARANCE,
    ServiceSection.SLIDE,
    ServiceSection.CLUTCH,
    ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
    ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
  ];

  for (const serviceData of actualWorkOrders) {
    // Create the main service record with all observation fields
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
        // Observation fields
        isPressLevel: serviceData.isPressLevel,
        driveBeltCondition: serviceData.driveBeltCondition,
        areAllProtectiveCovers: serviceData.areAllProtectiveCovers,
        isMainMotorSecure: serviceData.isMainMotorSecure,
        isMotorPlateSecure: serviceData.isMotorPlateSecure,
        areCracksVisible: serviceData.areCracksVisible,
      },
    });

    console.log(
      `✓ Created service: WO #${serviceData.workOrderNumber} (${serviceData.date.toISOString().split('T')[0]})`,
    );

    // ========================================================================
    // BEARING CLEARANCE SECTION
    // ========================================================================
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

    // Create AlertBearingClearance
    const outerTotalDiff = Math.abs(
      serviceData.outerData.totalClearance_LH - serviceData.outerData.totalClearance_RH,
    );
    const innerTotalDiff = Math.abs(
      serviceData.innerData.totalClearance_LH - serviceData.innerData.totalClearance_RH,
    );

    await prisma.alertBearingClearance.upsert({
      where: { machineServiceId: service.id },
      update: {},
      create: {
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

    // ========================================================================
    // SLIDE SECTION
    // ========================================================================
    const slideOuterData = await createSlideData(
      prisma,
      `${serviceData.id}-slide-outer`,
      serviceData.slideOuter,
    );
    const slideInnerData = await createSlideData(
      prisma,
      `${serviceData.id}-slide-inner`,
      serviceData.slideInner,
    );

    await prisma.machineServiceSlide.upsert({
      where: { id: `${serviceData.id}-slide` },
      update: {},
      create: {
        id: `${serviceData.id}-slide`,
        machineServiceId: service.id,
        outerDataId: slideOuterData.id,
        innerDataId: slideInnerData.id,
      },
    });

    // Create AlertSlide
    await prisma.alertSlide.upsert({
      where: { machineServiceId: service.id },
      update: {},
      create: {
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
    console.log('  ✓ Created slide data and alerts');

    // ========================================================================
    // CLUTCH SECTION
    // ========================================================================
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
    await prisma.alertClutch.upsert({
      where: { machineServiceId: service.id },
      update: {},
      create: {
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
        fb_severity: calculateClutchAlertSeverity(
          serviceData.clutch.brakeAnchorFB,
          0.04,
          0.06,
          0.08,
        ),
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

    // ========================================================================
    // LUBRICATION/HYDRAULICS SECTION
    // ========================================================================
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

    console.log('  ✓ Created lubrication/hydraulics data');

    // ========================================================================
    // COUNTERBALANCE/CYLINDER/AIRBAG SECTION
    // ========================================================================
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
    console.log('  ✓ Created counterbalance/cylinder data');
  }

  console.log(`\n✓ Created ${actualWorkOrders.length} comprehensive inspection services`);
  console.log('  - Work Order #22522 (2022-02-24)');
  console.log('  - Work Order #9062024 (2024-09-06)');
}
