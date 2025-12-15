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
} from '../../../generated/prisma/client';

// ============================================================================
// SCHAEFFLER BRASIL - INSPECTION DATA
// ============================================================================
// Date: January 4, 2023
// Technician: Julio De Souza
// Equipment: Minster P2H #30576 (160 ton)
// Overall Grade: A- (91/100)
//
// Key Findings:
// ✓ Excellent bearing clearances (0.019" - within optimal range)
// ✓ All safety systems functional
// ✓ Press level and properly mounted
// ⚠️ Filter replacement needed
// ⚠️ Oil change recommended
//
// P2H Model Note:
// - Clearance concentrated in main crankshaft bearings
// - Individual component measurements not applicable for this configuration
// - Total clearance measurement is primary indicator
// ============================================================================

interface ServiceData {
  id: string;
  date: Date;
  type: ServiceType;
  isPressLevel: YesNoNaDncType;
  driveBeltCondition: DriveBeltConditionType;
  areAllProtectiveCovers: ProtectiveCoversStatusType;
  isMainMotorSecure: YesNoDncType;
  areCracksVisible: YesNoDncType;
  // Bearing clearance - P2H only has total clearance measurements
  bearingClearance: {
    totalClearance_LH: number;
    totalClearance_RH: number;
  };
  // Clutch data
  clutch: {
    brakeAnchorFTB: number;
    brakeAnchorRTB: number;
    hydClutchClearanceTotal: number;
    flywheelBearings: FlywheelBearingsType;
    flywheelBrake: FlywheelBrakeType;
    rotaryUnion: RotaryUnionType;
    clutchLining: ClutchLiningType;
    clutchSeals: ClutchSealsType;
  };
  // Lubrication data
  lubrication: {
    oilChanged: YesNoDncType;
    filterChanged: YesNoDncType;
    oilType: string;
    oilTempF: number;
    notes: string;
  };
}

// January 4, 2023 inspection data from provided JSON/text
const schaefflerService30576: ServiceData = {
  id: 'schaeffler-service-30576-2023-01-04',
  date: new Date('2023-01-04'),
  type: ServiceType.INSPECTION,
  isPressLevel: YesNoNaDncType.YES,
  driveBeltCondition: DriveBeltConditionType.OK,
  areAllProtectiveCovers: ProtectiveCoversStatusType.YES,
  isMainMotorSecure: YesNoDncType.YES,
  areCracksVisible: YesNoDncType.NO,
  // Bearing clearance from JSON: LH 0.019, RH 0.0195
  bearingClearance: {
    totalClearance_LH: 0.019,
    totalClearance_RH: 0.0195,
  },
  // Clutch data from JSON
  clutch: {
    brakeAnchorFTB: 0.013,
    brakeAnchorRTB: 0.013,
    hydClutchClearanceTotal: 0.079,
    flywheelBearings: FlywheelBearingsType.OK,
    flywheelBrake: FlywheelBrakeType.OK,
    rotaryUnion: RotaryUnionType.OK,
    clutchLining: ClutchLiningType.OK,
    clutchSeals: ClutchSealsType.OK,
  },
  // Lubrication data from JSON
  lubrication: {
    oilChanged: YesNoDncType.NO,
    filterChanged: YesNoDncType.NO,
    oilType: 'Mobil 424',
    oilTempF: 96,
    notes: 'The filter need be replace / GA1-270PSI GA3-1400PSI GA4-1730PSI GA5-350PSI GA6-1450',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

async function createSchaefflerServiceWithData(
  prisma: PrismaClient,
  serviceData: ServiceData,
  machine: Machine,
  technician: User,
) {
  // P2H only has these sections
  const completedSections = [
    ServiceSection.BEARING_CLEARANCE,
    ServiceSection.CLUTCH,
    ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
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
      isMotorPlateSecure: YesNoDncType.YES,
      areCracksVisible: serviceData.areCracksVisible,
    },
  });

  console.log(`  ✓ Jan 4, 2023 inspection (${serviceData.date.toISOString().split('T')[0]})`);

  // ========================================================================
  // BEARING CLEARANCE
  // ========================================================================
  // P2H model: Only total clearance is measured
  // Other component measurements are set to 0 (not applicable)

  // Create outer before data (same as data for P2H - no adjustment)
  const outerBeforeData = await prisma.bearingClearanceData.upsert({
    where: { id: `${serviceData.id}-outer-before` },
    update: {},
    create: {
      id: `${serviceData.id}-outer-before`,
      totalClearance_RH: serviceData.bearingClearance.totalClearance_RH,
      totalClearance_LH: serviceData.bearingClearance.totalClearance_LH,
      // P2H: Individual components not measured
      mainBearings_RH: 0,
      mainBearings_LH: 0,
      upperConnectionBearings_RH: 0,
      upperConnectionBearings_LH: 0,
      wristPinToMatingPart_RH: 0,
      wristPinToMatingPart_LH: 0,
      wristPinToBushing_RH: 0,
      wristPinToBushing_LH: 0,
      slideAdjNutToScrewSleeve_RH: 0,
      slideAdjNutToScrewSleeve_LH: 0,
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

  // Create outer data (after - same as before for P2H, no adjustment made)
  const outerDataRecord = await prisma.bearingClearanceData.upsert({
    where: { id: `${serviceData.id}-outer-data` },
    update: {},
    create: {
      id: `${serviceData.id}-outer-data`,
      totalClearance_RH: serviceData.bearingClearance.totalClearance_RH,
      totalClearance_LH: serviceData.bearingClearance.totalClearance_LH,
      mainBearings_RH: 0,
      mainBearings_LH: 0,
      upperConnectionBearings_RH: 0,
      upperConnectionBearings_LH: 0,
      wristPinToMatingPart_RH: 0,
      wristPinToMatingPart_LH: 0,
      wristPinToBushing_RH: 0,
      wristPinToBushing_LH: 0,
      slideAdjNutToScrewSleeve_RH: 0,
      slideAdjNutToScrewSleeve_LH: 0,
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

  // P2H doesn't have inner bearing measurements - create empty records
  const innerBeforeData = await prisma.bearingClearanceData.upsert({
    where: { id: `${serviceData.id}-inner-before` },
    update: {},
    create: {
      id: `${serviceData.id}-inner-before`,
      totalClearance_RH: 0,
      totalClearance_LH: 0,
      mainBearings_RH: 0,
      mainBearings_LH: 0,
      upperConnectionBearings_RH: 0,
      upperConnectionBearings_LH: 0,
      wristPinToMatingPart_RH: 0,
      wristPinToMatingPart_LH: 0,
      wristPinToBushing_RH: 0,
      wristPinToBushing_LH: 0,
      slideAdjNutToScrewSleeve_RH: 0,
      slideAdjNutToScrewSleeve_LH: 0,
      extraDoubleLockOpen_RH: 0,
      extraDoubleLockOpen_LH: 0,
      ballBoxArea_RH: 0,
      ballBoxArea_LH: 0,
      hasBeenAdjusted: YesNoNaDncType.NA,
      matingPart: MatingPartType.BUSHING,
      slideMotorMounts: ConditionOkNaDncBrokenWornType.NA,
      powerCordHoses: ConditionOkNaDncDamagedType.NA,
      chainsGearsSprockets: ConditionOkNaDncBrokenLooseType.NA,
      lockingClamps: ConditionOkNaDncDamagedType.NA,
    },
  });

  const innerDataRecord = await prisma.bearingClearanceData.upsert({
    where: { id: `${serviceData.id}-inner-data` },
    update: {},
    create: {
      id: `${serviceData.id}-inner-data`,
      totalClearance_RH: 0,
      totalClearance_LH: 0,
      mainBearings_RH: 0,
      mainBearings_LH: 0,
      upperConnectionBearings_RH: 0,
      upperConnectionBearings_LH: 0,
      wristPinToMatingPart_RH: 0,
      wristPinToMatingPart_LH: 0,
      wristPinToBushing_RH: 0,
      wristPinToBushing_LH: 0,
      slideAdjNutToScrewSleeve_RH: 0,
      slideAdjNutToScrewSleeve_LH: 0,
      extraDoubleLockOpen_RH: 0,
      extraDoubleLockOpen_LH: 0,
      ballBoxArea_RH: 0,
      ballBoxArea_LH: 0,
      hasBeenAdjusted: YesNoNaDncType.NA,
      matingPart: MatingPartType.BUSHING,
      slideMotorMounts: ConditionOkNaDncBrokenWornType.NA,
      powerCordHoses: ConditionOkNaDncDamagedType.NA,
      chainsGearsSprockets: ConditionOkNaDncBrokenLooseType.NA,
      lockingClamps: ConditionOkNaDncDamagedType.NA,
    },
  });

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
    serviceData.bearingClearance.totalClearance_LH - serviceData.bearingClearance.totalClearance_RH,
  );

  await prisma.alertBearingClearance.create({
    data: {
      machineServiceId: service.id,
      // Outer measurements (main crankshaft bearings for P2H)
      outer_totalClearance_differential: outerTotalDiff,
      outer_totalClearance_severity: calculateAlertSeverity(
        serviceData.bearingClearance.totalClearance_LH,
        serviceData.bearingClearance.totalClearance_RH,
        0.015,
        0.025,
        0.03,
      ),
      // Other fields set to NONE (not measured for P2H)
      outer_mainBearings_differential: 0,
      outer_mainBearings_severity: AlertSeverity.NONE,
      outer_upperConnectionBearings_differential: 0,
      outer_upperConnectionBearings_severity: AlertSeverity.NONE,
      outer_wristPinToMatingPart_differential: 0,
      outer_wristPinToMatingPart_severity: AlertSeverity.NONE,
      outer_wristPinToBushing_differential: 0,
      outer_wristPinToBushing_severity: AlertSeverity.NONE,
      outer_slideAdjNutToScrewSleeve_differential: 0,
      outer_slideAdjNutToScrewSleeve_severity: AlertSeverity.NONE,
      // Inner measurements (not applicable for P2H)
      inner_totalClearance_differential: 0,
      inner_totalClearance_severity: AlertSeverity.NONE,
      inner_mainBearings_differential: 0,
      inner_mainBearings_severity: AlertSeverity.NONE,
      inner_upperConnectionBearings_differential: 0,
      inner_upperConnectionBearings_severity: AlertSeverity.NONE,
      inner_wristPinToMatingPart_differential: 0,
      inner_wristPinToMatingPart_severity: AlertSeverity.NONE,
      inner_wristPinToBushing_differential: 0,
      inner_wristPinToBushing_severity: AlertSeverity.NONE,
      inner_slideAdjNutToScrewSleeve_differential: 0,
      inner_slideAdjNutToScrewSleeve_severity: AlertSeverity.NONE,
      thresholdSnapshot: {
        totalClearance_greenMin: 0.015,
        totalClearance_yellowMin: 0.025,
        totalClearance_redMin: 0.03,
        mainBearings_greenMin: 0.015,
        mainBearings_yellowMin: 0.025,
        mainBearings_redMin: 0.03,
        upperConnectionBearings_greenMin: 0.008,
        upperConnectionBearings_yellowMin: 0.015,
        upperConnectionBearings_redMin: 0.025,
        wristPinToMatingPart_greenMin: 0.005,
        wristPinToMatingPart_yellowMin: 0.012,
        wristPinToMatingPart_redMin: 0.02,
        wristPinToBushing_greenMin: 0.004,
        wristPinToBushing_yellowMin: 0.01,
        wristPinToBushing_redMin: 0.018,
        slideAdjNutToScrewSleeve_greenMin: 0.003,
        slideAdjNutToScrewSleeve_yellowMin: 0.008,
        slideAdjNutToScrewSleeve_redMin: 0.015,
      },
    },
  });
  console.log('  ✓ Created bearing clearance data and alerts');

  // ========================================================================
  // CLUTCH
  // ========================================================================
  const clutchData = await prisma.clutchData.upsert({
    where: { id: `${serviceData.id}-clutch-data` },
    update: {},
    create: {
      id: `${serviceData.id}-clutch-data`,
      brakeSpringBrake: 0, // Not recorded in inspection
      brakeSpringStudBolt: BrakeSpringStudBoltType.OK,
      brakeLining: BrakeLiningType.OK,
      brakeSpringFB: 0, // Not recorded in inspection
      brakeSpringFTB: serviceData.clutch.brakeAnchorFTB,
      brakeSpringRTB: serviceData.clutch.brakeAnchorRTB,
      flywheelBearings: serviceData.clutch.flywheelBearings,
      flywheelBrake: serviceData.clutch.flywheelBrake,
      rotaryUnion: serviceData.clutch.rotaryUnion,
      clutchLining: serviceData.clutch.clutchLining,
      clutchSeals: serviceData.clutch.clutchSeals,
      separateBrakeSeals: SeparateBrakeSealsType.OK,
      flexDisc: FlexDiscType.OK,
      hydClutchClearanceTotal: serviceData.clutch.hydClutchClearanceTotal,
      hydClutchClearanceRear: 0, // Not recorded in inspection
      hydraulicPressureValue: 0, // Not recorded - only gauge readings in notes
    },
  });

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
        0.06,
        0.12,
        0.188,
      ),
      hydClutchClearanceRear_value: 0,
      hydClutchClearanceRear_severity: AlertSeverity.NONE, // Not recorded
      fb_value: 0,
      fb_severity: AlertSeverity.NONE, // Not recorded
      fTB_value: serviceData.clutch.brakeAnchorFTB,
      fTB_severity: calculateClutchAlertSeverity(
        serviceData.clutch.brakeAnchorFTB,
        0.005,
        0.012,
        0.015,
      ),
      rTB_value: serviceData.clutch.brakeAnchorRTB,
      rTB_severity: calculateClutchAlertSeverity(
        serviceData.clutch.brakeAnchorRTB,
        0.005,
        0.012,
        0.015,
      ),
      thresholdSnapshot: {
        hydClutchClearanceTotal_greenMin: 0.06,
        hydClutchClearanceTotal_yellowMin: 0.12,
        hydClutchClearanceTotal_redMin: 0.188,
        hydClutchClearanceRear_greenMin: 0.015,
        hydClutchClearanceRear_yellowMin: 0.078,
        hydClutchClearanceRear_redMin: 0.105,
        fb_greenMin: 0.045,
        fb_yellowMin: 0.052,
        fb_redMin: 0.055,
        fTB_greenMin: 0.005,
        fTB_yellowMin: 0.012,
        fTB_redMin: 0.015,
        rTB_greenMin: 0.005,
        rTB_yellowMin: 0.012,
        rTB_redMin: 0.015,
      },
    },
  });
  console.log('  ✓ Created clutch data and alerts');

  // ========================================================================
  // LUBRICATION
  // ========================================================================
  const lubricationData = await prisma.lubricationHydraulicsData.upsert({
    where: { id: `${serviceData.id}-lubrication-data` },
    update: {},
    create: {
      id: `${serviceData.id}-lubrication-data`,
      changedOil: serviceData.lubrication.oilChanged,
      changedFilter: serviceData.lubrication.filterChanged,
      // Additional notes stored in service notes if needed
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
  console.log('  ✓ Created lubrication data');

  return service;
}

// ============================================================================
// EXPORTED FUNCTION
// ============================================================================

/**
 * Seed Schaeffler services (Sorocaba)
 * Equipment: #30576 (1 inspection - Jan 4, 2023)
 */
export async function seedSchaefflerServices(
  prisma: PrismaClient,
  machine30576: Machine,
  technician: User,
) {
  console.log('Creating Schaeffler services...');
  console.log(`\n  ${machine30576.name}:`);

  await createSchaefflerServiceWithData(prisma, schaefflerService30576, machine30576, technician);

  console.log(`\n✓ Created 1 Schaeffler inspection`);
}
