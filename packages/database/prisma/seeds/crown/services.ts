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
} from '../../../generated/prisma/client';

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

interface ServiceData {
  id: string;
  date: Date;
  type: ServiceType;
  workOrderNumber: string;
  // Observation fields
  isPressLevel: YesNoNaDncType;
  isMainMotorSecure: YesNoDncType;
  isMotorPlateSecure: YesNoDncType;
  areCracksVisible: YesNoDncType;
  // Bearing measurements
  outerBefore: BearingMeasurement;
  outerData: BearingMeasurement;
  innerBefore: BearingMeasurement;
  innerData: BearingMeasurement;
}

// Historical service data showing progression over time
// This creates realistic data for graph visualization
const historicalServices: ServiceData[] = [
  {
    // Service 1: 2022-02-24 (WO #22522 - actual Minster data)
    id: 'crown-service-2022-02-24',
    date: new Date('2022-02-24'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '22522',
    isPressLevel: YesNoNaDncType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    outerBefore: {
      totalClearance_RH: 0.019,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.008,
      mainBearings_LH: 0.009,
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
      mainBearings_RH: 0.008,
      mainBearings_LH: 0.009,
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
      mainBearings_RH: 0.007,
      mainBearings_LH: 0.008,
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
      mainBearings_RH: 0.007,
      mainBearings_LH: 0.008,
      upperConnectionBearings_RH: 0.005,
      upperConnectionBearings_LH: 0.006,
      wristPinToMatingPart_RH: 0.003,
      wristPinToMatingPart_LH: 0.004,
      wristPinToBushing_RH: 0.002,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.001,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
  },
  {
    // Service 2: 2022-08-15 (simulated - slight increase)
    id: 'crown-service-2022-08-15',
    date: new Date('2022-08-15'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '22815',
    isPressLevel: YesNoNaDncType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    outerBefore: {
      totalClearance_RH: 0.02,
      totalClearance_LH: 0.022,
      mainBearings_RH: 0.009,
      mainBearings_LH: 0.01,
      upperConnectionBearings_RH: 0.007,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.006,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    outerData: {
      totalClearance_RH: 0.02,
      totalClearance_LH: 0.022,
      mainBearings_RH: 0.009,
      mainBearings_LH: 0.01,
      upperConnectionBearings_RH: 0.007,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.006,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    innerBefore: {
      totalClearance_RH: 0.019,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.008,
      mainBearings_LH: 0.009,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
    innerData: {
      totalClearance_RH: 0.019,
      totalClearance_LH: 0.021,
      mainBearings_RH: 0.008,
      mainBearings_LH: 0.009,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
    },
  },
  {
    // Service 3: 2023-02-10 (simulated - normal wear)
    id: 'crown-service-2023-02-10',
    date: new Date('2023-02-10'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '23210',
    isPressLevel: YesNoNaDncType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    outerBefore: {
      totalClearance_RH: 0.022,
      totalClearance_LH: 0.024,
      mainBearings_RH: 0.011,
      mainBearings_LH: 0.012,
      upperConnectionBearings_RH: 0.009,
      upperConnectionBearings_LH: 0.01,
      wristPinToMatingPart_RH: 0.007,
      wristPinToMatingPart_LH: 0.008,
      wristPinToBushing_RH: 0.005,
      wristPinToBushing_LH: 0.006,
      slideAdjNutToScrewSleeve_RH: 0.004,
      slideAdjNutToScrewSleeve_LH: 0.004,
    },
    outerData: {
      totalClearance_RH: 0.022,
      totalClearance_LH: 0.024,
      mainBearings_RH: 0.011,
      mainBearings_LH: 0.012,
      upperConnectionBearings_RH: 0.009,
      upperConnectionBearings_LH: 0.01,
      wristPinToMatingPart_RH: 0.007,
      wristPinToMatingPart_LH: 0.008,
      wristPinToBushing_RH: 0.005,
      wristPinToBushing_LH: 0.006,
      slideAdjNutToScrewSleeve_RH: 0.004,
      slideAdjNutToScrewSleeve_LH: 0.004,
    },
    innerBefore: {
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.023,
      mainBearings_RH: 0.01,
      mainBearings_LH: 0.011,
      upperConnectionBearings_RH: 0.008,
      upperConnectionBearings_LH: 0.009,
      wristPinToMatingPart_RH: 0.006,
      wristPinToMatingPart_LH: 0.007,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.005,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    innerData: {
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.023,
      mainBearings_RH: 0.01,
      mainBearings_LH: 0.011,
      upperConnectionBearings_RH: 0.008,
      upperConnectionBearings_LH: 0.009,
      wristPinToMatingPart_RH: 0.006,
      wristPinToMatingPart_LH: 0.007,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.005,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
  },
  {
    // Service 4: 2023-08-20 (simulated - approaching threshold, YELLOW alert)
    id: 'crown-service-2023-08-20',
    date: new Date('2023-08-20'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '23820',
    isPressLevel: YesNoNaDncType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    outerBefore: {
      totalClearance_RH: 0.024,
      totalClearance_LH: 0.027,
      mainBearings_RH: 0.014,
      mainBearings_LH: 0.016,
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
      totalClearance_RH: 0.024,
      totalClearance_LH: 0.027,
      mainBearings_RH: 0.014,
      mainBearings_LH: 0.016,
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
      totalClearance_RH: 0.023,
      totalClearance_LH: 0.026,
      mainBearings_RH: 0.013,
      mainBearings_LH: 0.015,
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
      totalClearance_RH: 0.023,
      totalClearance_LH: 0.026,
      mainBearings_RH: 0.013,
      mainBearings_LH: 0.015,
      upperConnectionBearings_RH: 0.011,
      upperConnectionBearings_LH: 0.013,
      wristPinToMatingPart_RH: 0.008,
      wristPinToMatingPart_LH: 0.01,
      wristPinToBushing_RH: 0.006,
      wristPinToBushing_LH: 0.007,
      slideAdjNutToScrewSleeve_RH: 0.005,
      slideAdjNutToScrewSleeve_LH: 0.006,
    },
  },
  {
    // Service 5: 2024-02-05 (simulated - needs attention, YELLOW alert higher)
    id: 'crown-service-2024-02-05',
    date: new Date('2024-02-05'),
    type: ServiceType.INSPECTION,
    workOrderNumber: '24205',
    isPressLevel: YesNoNaDncType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    outerBefore: {
      totalClearance_RH: 0.026,
      totalClearance_LH: 0.03,
      mainBearings_RH: 0.017,
      mainBearings_LH: 0.02,
      upperConnectionBearings_RH: 0.014,
      upperConnectionBearings_LH: 0.017,
      wristPinToMatingPart_RH: 0.011,
      wristPinToMatingPart_LH: 0.013,
      wristPinToBushing_RH: 0.009,
      wristPinToBushing_LH: 0.01,
      slideAdjNutToScrewSleeve_RH: 0.007,
      slideAdjNutToScrewSleeve_LH: 0.009,
    },
    outerData: {
      totalClearance_RH: 0.026,
      totalClearance_LH: 0.03,
      mainBearings_RH: 0.017,
      mainBearings_LH: 0.02,
      upperConnectionBearings_RH: 0.014,
      upperConnectionBearings_LH: 0.017,
      wristPinToMatingPart_RH: 0.011,
      wristPinToMatingPart_LH: 0.013,
      wristPinToBushing_RH: 0.009,
      wristPinToBushing_LH: 0.01,
      slideAdjNutToScrewSleeve_RH: 0.007,
      slideAdjNutToScrewSleeve_LH: 0.009,
    },
    innerBefore: {
      totalClearance_RH: 0.025,
      totalClearance_LH: 0.029,
      mainBearings_RH: 0.016,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.013,
      upperConnectionBearings_LH: 0.016,
      wristPinToMatingPart_RH: 0.01,
      wristPinToMatingPart_LH: 0.012,
      wristPinToBushing_RH: 0.008,
      wristPinToBushing_LH: 0.009,
      slideAdjNutToScrewSleeve_RH: 0.006,
      slideAdjNutToScrewSleeve_LH: 0.008,
    },
    innerData: {
      totalClearance_RH: 0.025,
      totalClearance_LH: 0.029,
      mainBearings_RH: 0.016,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.013,
      upperConnectionBearings_LH: 0.016,
      wristPinToMatingPart_RH: 0.01,
      wristPinToMatingPart_LH: 0.012,
      wristPinToBushing_RH: 0.008,
      wristPinToBushing_LH: 0.009,
      slideAdjNutToScrewSleeve_RH: 0.006,
      slideAdjNutToScrewSleeve_LH: 0.008,
    },
  },
  {
    // Service 6: 2024-09-06 (WO #9062024 - after maintenance, back to GREEN)
    id: 'crown-service-2024-09-06',
    date: new Date('2024-09-06'),
    type: ServiceType.MAINTENANCE,
    workOrderNumber: '9062024',
    isPressLevel: YesNoNaDncType.YES,
    isMainMotorSecure: YesNoDncType.YES,
    isMotorPlateSecure: YesNoDncType.YES,
    areCracksVisible: YesNoDncType.NO,
    outerBefore: {
      totalClearance_RH: 0.026,
      totalClearance_LH: 0.03,
      mainBearings_RH: 0.017,
      mainBearings_LH: 0.02,
      upperConnectionBearings_RH: 0.014,
      upperConnectionBearings_LH: 0.017,
      wristPinToMatingPart_RH: 0.011,
      wristPinToMatingPart_LH: 0.013,
      wristPinToBushing_RH: 0.009,
      wristPinToBushing_LH: 0.01,
      slideAdjNutToScrewSleeve_RH: 0.007,
      slideAdjNutToScrewSleeve_LH: 0.009,
    },
    outerData: {
      // After maintenance - values improved
      totalClearance_RH: 0.021,
      totalClearance_LH: 0.023,
      mainBearings_RH: 0.009,
      mainBearings_LH: 0.01,
      upperConnectionBearings_RH: 0.007,
      upperConnectionBearings_LH: 0.008,
      wristPinToMatingPart_RH: 0.005,
      wristPinToMatingPart_LH: 0.006,
      wristPinToBushing_RH: 0.004,
      wristPinToBushing_LH: 0.004,
      slideAdjNutToScrewSleeve_RH: 0.003,
      slideAdjNutToScrewSleeve_LH: 0.003,
    },
    innerBefore: {
      totalClearance_RH: 0.025,
      totalClearance_LH: 0.029,
      mainBearings_RH: 0.016,
      mainBearings_LH: 0.019,
      upperConnectionBearings_RH: 0.013,
      upperConnectionBearings_LH: 0.016,
      wristPinToMatingPart_RH: 0.01,
      wristPinToMatingPart_LH: 0.012,
      wristPinToBushing_RH: 0.008,
      wristPinToBushing_LH: 0.009,
      slideAdjNutToScrewSleeve_RH: 0.006,
      slideAdjNutToScrewSleeve_LH: 0.008,
    },
    innerData: {
      // After maintenance - values improved
      totalClearance_RH: 0.02,
      totalClearance_LH: 0.022,
      mainBearings_RH: 0.008,
      mainBearings_LH: 0.009,
      upperConnectionBearings_RH: 0.006,
      upperConnectionBearings_LH: 0.007,
      wristPinToMatingPart_RH: 0.004,
      wristPinToMatingPart_LH: 0.005,
      wristPinToBushing_RH: 0.003,
      wristPinToBushing_LH: 0.003,
      slideAdjNutToScrewSleeve_RH: 0.002,
      slideAdjNutToScrewSleeve_LH: 0.002,
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
  if (differential >= greenMin) return AlertSeverity.GREEN;
  return AlertSeverity.GREEN;
}

export async function seedCrownServices(prisma: PrismaClient, machine: Machine, technician: User) {
  console.log('Creating Crown services with historical data...');

  for (const serviceData of historicalServices) {
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
        completedSections: JSON.stringify([ServiceSection.BEARING_CLEARANCE]),
        selectedSections: JSON.stringify([ServiceSection.BEARING_CLEARANCE]),
        currentStep: 'summary',
        isPressLevel: serviceData.isPressLevel,
        isMainMotorSecure: serviceData.isMainMotorSecure,
        isMotorPlateSecure: serviceData.isMotorPlateSecure,
        areCracksVisible: serviceData.areCracksVisible,
      },
    });

    console.log(
      `✓ Created/Updated service: ${service.id} (${serviceData.date.toISOString().split('T')[0]})`,
    );

    // Create bearing clearance data records
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

    // Create the bearing clearance section record
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

    // Calculate and create alerts based on thresholds
    // Thresholds: greenMin=0.015, yellowMin=0.025, redMin=0.035
    const outerTotalDiff = Math.abs(
      serviceData.outerData.totalClearance_LH - serviceData.outerData.totalClearance_RH,
    );
    const innerTotalDiff = Math.abs(
      serviceData.innerData.totalClearance_LH - serviceData.innerData.totalClearance_RH,
    );

    // Create alert record for bearing clearance
    await prisma.alertBearingClearance.upsert({
      where: { machineServiceId: service.id },
      update: {},
      create: {
        machineServiceId: service.id,
        // Outer alerts
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
        outer_mainBearings_severity: calculateAlertSeverity(
          serviceData.outerData.mainBearings_LH,
          serviceData.outerData.mainBearings_RH,
          0.01,
          0.02,
          0.03,
        ),
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
        // Inner alerts
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

    console.log(`  ✓ Created bearing clearance data and alerts`);
  }

  console.log(`✓ Created ${historicalServices.length} historical services`);
}
