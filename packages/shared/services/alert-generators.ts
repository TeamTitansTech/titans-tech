import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Alert severity enum
 */
export enum AlertSeverity {
  NONE = 'NONE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

/**
 * Determines severity based on a value compared to thresholds
 */
function determineSeverity(
  value: Decimal,
  greenMin: Decimal,
  yellowMin: Decimal,
  redMin: Decimal,
): AlertSeverity {
  if (value.greaterThanOrEqualTo(greenMin) && value.lessThan(yellowMin)) {
    return AlertSeverity.GREEN;
  } else if (value.greaterThanOrEqualTo(yellowMin) && value.lessThan(redMin)) {
    return AlertSeverity.YELLOW;
  } else if (value.greaterThanOrEqualTo(redMin)) {
    return AlertSeverity.RED;
  } else {
    return AlertSeverity.NONE;
  }
}

/**
 * Calculate field alert for bearing clearance type measurements
 */
function calculateFieldAlert(
  RH: Decimal,
  LH: Decimal,
  greenMin: Decimal,
  yellowMin: Decimal,
  redMin: Decimal,
): { RH: Decimal; LH: Decimal; differential: Decimal; severity: AlertSeverity } {
  const differential = RH.minus(LH).abs();
  const severity = determineSeverity(differential, greenMin, yellowMin, redMin);
  return { RH, LH, differential, severity };
}

/**
 * Evaluates a single measurement value against thresholds
 */
function evaluateSingleValueAlert(
  value: Decimal | null,
  greenMin: Decimal,
  yellowMin: Decimal,
  redMin: Decimal,
): { value: Decimal; severity: AlertSeverity } {
  if (value === null) {
    return { value: new Decimal(0), severity: AlertSeverity.NONE };
  }
  const severity = determineSeverity(value, greenMin, yellowMin, redMin);
  return { value, severity };
}

/**
 * Calculate slide max deviation from 5 position measurements
 */
function calculateSlideMaxDeviationAlert(
  data: any,
  threshold: any,
): { differential: Decimal; severity: AlertSeverity } {
  if (!data) {
    return { differential: new Decimal(0), severity: AlertSeverity.NONE };
  }

  const positions = [
    data.position1,
    data.position2,
    data.position3,
    data.position4,
    data.position5,
  ].filter((p) => p !== null && p !== undefined);

  if (positions.length === 0) {
    return { differential: new Decimal(0), severity: AlertSeverity.NONE };
  }

  const max = Decimal.max(...positions);
  const min = Decimal.min(...positions);
  const differential = max.minus(min).abs();

  const severity = determineSeverity(
    differential,
    threshold.maxDeviation_greenMin,
    threshold.maxDeviation_yellowMin,
    threshold.maxDeviation_redMin,
  );

  return { differential, severity };
}

/**
 * Calculate GIBS usable value
 */
function calculateGibsUsable(data: any): Decimal | null {
  const toNum = (val: any): number =>
    val && typeof val.toNumber === 'function' ? val.toNumber() : Number(val) || 0;
  const isNum = (val: any): boolean => {
    const num = val && typeof val.toNumber === 'function' ? val.toNumber() : Number(val);
    return typeof num === 'number' && !isNaN(num);
  };

  const allPointsCount = [
    data.point13,
    data.point9,
    data.point14,
    data.point10,
    data.point15,
    data.point16,
    data.point11,
    data.point12,
  ].filter(isNum).length;

  const backPointsCount = [data.point13, data.point14, data.point15, data.point16].filter(
    isNum,
  ).length;

  const frontPointsCount = [data.point9, data.point11, data.point10, data.point12].filter(
    isNum,
  ).length;

  let usable: number | null = null;

  if (allPointsCount === 8) {
    const minLeft = Math.min(
      toNum(data.point13),
      toNum(data.point9),
      toNum(data.point15),
      toNum(data.point11),
    );
    const minRight = Math.min(
      toNum(data.point14),
      toNum(data.point10),
      toNum(data.point16),
      toNum(data.point12),
    );
    usable = minLeft + minRight;
  } else if (backPointsCount === 4) {
    const minBackLeft = Math.min(toNum(data.point13), toNum(data.point15));
    const minBackRight = Math.min(toNum(data.point14), toNum(data.point16));
    usable = minBackLeft + minBackRight;
  } else if (frontPointsCount === 4) {
    const minFrontLeft = Math.min(toNum(data.point9), toNum(data.point11));
    const minFrontRight = Math.min(toNum(data.point10), toNum(data.point12));
    usable = minFrontLeft + minFrontRight;
  }

  return usable !== null ? new Decimal(usable) : null;
}

/**
 * Calculate pistons alerts
 */
function calculatePistonsAlerts(data: any, threshold: any) {
  const toDecimal = (val: any): Decimal | null => {
    if (val === null || val === undefined) return null;
    return val instanceof Decimal ? val : new Decimal(val);
  };

  const lhTop = toDecimal(data.lhTop);
  const lhBottom = toDecimal(data.lhBottom);
  const lhLeft = toDecimal(data.lhLeft);
  const lhRight = toDecimal(data.lhRight);
  const rhTop = toDecimal(data.rhTop);
  const rhBottom = toDecimal(data.rhBottom);
  const rhLeft = toDecimal(data.rhLeft);
  const rhRight = toDecimal(data.rhRight);

  const calculateSumAlert = (
    val1: Decimal | null,
    val2: Decimal | null,
  ): { value: Decimal | null; severity: AlertSeverity } => {
    if (val1 === null || val2 === null) {
      return { value: null, severity: AlertSeverity.NONE };
    }
    const sum = val1.plus(val2);
    let severity: AlertSeverity;
    if (sum.lessThanOrEqualTo(threshold.difference_greenMin)) {
      severity = AlertSeverity.GREEN;
    } else if (sum.lessThan(threshold.difference_redMin)) {
      severity = AlertSeverity.YELLOW;
    } else {
      severity = AlertSeverity.RED;
    }
    return { value: sum, severity };
  };

  return {
    lhLeftRight: calculateSumAlert(lhRight, lhLeft),
    rhLeftRight: calculateSumAlert(rhRight, rhLeft),
    lhTopBottom: calculateSumAlert(lhTop, lhBottom),
    rhTopBottom: calculateSumAlert(rhTop, rhBottom),
  };
}

/**
 * Calculate tramming sums and severities
 */
function calculateTrammingSums(
  data: any,
  threshold: any,
): {
  top_verticalSum: Decimal;
  top_verticalSeverity: AlertSeverity;
  top_horizontalSum: Decimal;
  top_horizontalSeverity: AlertSeverity;
  bottom_verticalSum: Decimal;
  bottom_verticalSeverity: AlertSeverity;
  bottom_horizontalSum: Decimal;
  bottom_horizontalSeverity: AlertSeverity;
  left_verticalSum: Decimal;
  left_verticalSeverity: AlertSeverity;
  left_horizontalSum: Decimal;
  left_horizontalSeverity: AlertSeverity;
  right_verticalSum: Decimal;
  right_verticalSeverity: AlertSeverity;
  right_horizontalSum: Decimal;
  right_horizontalSeverity: AlertSeverity;
} {
  const toNum = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (val instanceof Decimal || (val && typeof val.toNumber === 'function')) {
      return val.toNumber();
    }
    return Number(val) || 0;
  };

  const calculateSumAndSeverity = (
    val1: any,
    val2: any,
  ): { sum: Decimal; severity: AlertSeverity } => {
    const num1 = toNum(val1);
    const num2 = toNum(val2);
    const sum = new Decimal(num1 + num2);
    const severity = determineSeverity(
      sum,
      threshold.greenMin,
      threshold.yellowMin,
      threshold.redMin,
    );
    return { sum, severity };
  };

  const topVert = calculateSumAndSeverity(data.topVertical1, data.topVertical2);
  const topHoriz = calculateSumAndSeverity(data.topHorizontal1, data.topHorizontal2);
  const bottomVert = calculateSumAndSeverity(data.bottomVertical1, data.bottomVertical2);
  const bottomHoriz = calculateSumAndSeverity(data.bottomHorizontal1, data.bottomHorizontal2);
  const leftVert = calculateSumAndSeverity(data.leftVertical1, data.leftVertical2);
  const leftHoriz = calculateSumAndSeverity(data.leftHorizontal1, data.leftHorizontal2);
  const rightVert = calculateSumAndSeverity(data.rightVertical1, data.rightVertical2);
  const rightHoriz = calculateSumAndSeverity(data.rightHorizontal1, data.rightHorizontal2);

  return {
    top_verticalSum: topVert.sum,
    top_verticalSeverity: topVert.severity,
    top_horizontalSum: topHoriz.sum,
    top_horizontalSeverity: topHoriz.severity,
    bottom_verticalSum: bottomVert.sum,
    bottom_verticalSeverity: bottomVert.severity,
    bottom_horizontalSum: bottomHoriz.sum,
    bottom_horizontalSeverity: bottomHoriz.severity,
    left_verticalSum: leftVert.sum,
    left_verticalSeverity: leftVert.severity,
    left_horizontalSum: leftHoriz.sum,
    left_horizontalSeverity: leftHoriz.severity,
    right_verticalSum: rightVert.sum,
    right_verticalSeverity: rightVert.severity,
    right_horizontalSum: rightHoriz.sum,
    right_horizontalSeverity: rightHoriz.severity,
  };
}

// ============================================================================
// Alert Generation Functions
// ============================================================================

/**
 * Generate bearing clearance alerts for a service
 */
export async function generateBearingClearanceAlerts(
  prisma: PrismaClient,
  serviceId: string,
): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdBearingClearance: true,
            },
          },
        },
      },
      bearingClearance: {
        include: {
          outerData: true,
          innerData: true,
        },
      },
    },
  });

  if (!service) return null;

  const threshold = service.machine.blueprint.thresholdBearingClearance;
  if (!threshold) return null;
  if (!service.bearingClearance || service.bearingClearance.length === 0) return null;

  const outerData = service.bearingClearance[0].outerData;
  const innerData = service.bearingClearance[0].innerData;
  if (!outerData && !innerData) return null;

  const calculateAllFieldAlerts = (data: any) => ({
    totalClearance: calculateFieldAlert(
      data.totalClearance_RH,
      data.totalClearance_LH,
      threshold.totalClearance_greenMin,
      threshold.totalClearance_yellowMin,
      threshold.totalClearance_redMin,
    ),
    mainBearings: calculateFieldAlert(
      data.mainBearings_RH,
      data.mainBearings_LH,
      threshold.mainBearings_greenMin,
      threshold.mainBearings_yellowMin,
      threshold.mainBearings_redMin,
    ),
    upperConnectionBearings: calculateFieldAlert(
      data.upperConnectionBearings_RH,
      data.upperConnectionBearings_LH,
      threshold.upperConnectionBearings_greenMin,
      threshold.upperConnectionBearings_yellowMin,
      threshold.upperConnectionBearings_redMin,
    ),
    wristPinToMatingPart: calculateFieldAlert(
      data.wristPinToMatingPart_RH,
      data.wristPinToMatingPart_LH,
      threshold.wristPinToMatingPart_greenMin,
      threshold.wristPinToMatingPart_yellowMin,
      threshold.wristPinToMatingPart_redMin,
    ),
    wristPinToBushing: calculateFieldAlert(
      data.wristPinToBushing_RH,
      data.wristPinToBushing_LH,
      threshold.wristPinToBushing_greenMin,
      threshold.wristPinToBushing_yellowMin,
      threshold.wristPinToBushing_redMin,
    ),
    slideAdjNutToScrewSleeve: calculateFieldAlert(
      data.slideAdjNutToScrewSleeve_RH,
      data.slideAdjNutToScrewSleeve_LH,
      threshold.slideAdjNutToScrewSleeve_greenMin,
      threshold.slideAdjNutToScrewSleeve_yellowMin,
      threshold.slideAdjNutToScrewSleeve_redMin,
    ),
  });

  const outerAlerts = outerData ? calculateAllFieldAlerts(outerData) : null;
  const innerAlerts = innerData ? calculateAllFieldAlerts(innerData) : null;

  const defaultAlert = { differential: new Decimal(0), severity: AlertSeverity.NONE };

  const thresholdSnapshot = {
    blueprintId: threshold.blueprintId,
    totalClearance: {
      greenMin: threshold.totalClearance_greenMin.toNumber(),
      yellowMin: threshold.totalClearance_yellowMin.toNumber(),
      redMin: threshold.totalClearance_redMin.toNumber(),
    },
    mainBearings: {
      greenMin: threshold.mainBearings_greenMin.toNumber(),
      yellowMin: threshold.mainBearings_yellowMin.toNumber(),
      redMin: threshold.mainBearings_redMin.toNumber(),
    },
    upperConnectionBearings: {
      greenMin: threshold.upperConnectionBearings_greenMin.toNumber(),
      yellowMin: threshold.upperConnectionBearings_yellowMin.toNumber(),
      redMin: threshold.upperConnectionBearings_redMin.toNumber(),
    },
    wristPinToMatingPart: {
      greenMin: threshold.wristPinToMatingPart_greenMin.toNumber(),
      yellowMin: threshold.wristPinToMatingPart_yellowMin.toNumber(),
      redMin: threshold.wristPinToMatingPart_redMin.toNumber(),
    },
    wristPinToBushing: {
      greenMin: threshold.wristPinToBushing_greenMin.toNumber(),
      yellowMin: threshold.wristPinToBushing_yellowMin.toNumber(),
      redMin: threshold.wristPinToBushing_redMin.toNumber(),
    },
    slideAdjNutToScrewSleeve: {
      greenMin: threshold.slideAdjNutToScrewSleeve_greenMin.toNumber(),
      yellowMin: threshold.slideAdjNutToScrewSleeve_yellowMin.toNumber(),
      redMin: threshold.slideAdjNutToScrewSleeve_redMin.toNumber(),
    },
  };

  const alert = await (prisma as any).alertBearingClearance.create({
    data: {
      machineService: { connect: { id: serviceId } },
      outer_totalClearance_differential: (outerAlerts?.totalClearance || defaultAlert).differential,
      outer_totalClearance_severity: (outerAlerts?.totalClearance || defaultAlert).severity,
      outer_mainBearings_differential: (outerAlerts?.mainBearings || defaultAlert).differential,
      outer_mainBearings_severity: (outerAlerts?.mainBearings || defaultAlert).severity,
      outer_upperConnectionBearings_differential: (
        outerAlerts?.upperConnectionBearings || defaultAlert
      ).differential,
      outer_upperConnectionBearings_severity: (outerAlerts?.upperConnectionBearings || defaultAlert)
        .severity,
      outer_wristPinToMatingPart_differential: (outerAlerts?.wristPinToMatingPart || defaultAlert)
        .differential,
      outer_wristPinToMatingPart_severity: (outerAlerts?.wristPinToMatingPart || defaultAlert)
        .severity,
      outer_wristPinToBushing_differential: (outerAlerts?.wristPinToBushing || defaultAlert)
        .differential,
      outer_wristPinToBushing_severity: (outerAlerts?.wristPinToBushing || defaultAlert).severity,
      outer_slideAdjNutToScrewSleeve_differential: (
        outerAlerts?.slideAdjNutToScrewSleeve || defaultAlert
      ).differential,
      outer_slideAdjNutToScrewSleeve_severity: (
        outerAlerts?.slideAdjNutToScrewSleeve || defaultAlert
      ).severity,
      inner_totalClearance_differential: (innerAlerts?.totalClearance || defaultAlert).differential,
      inner_totalClearance_severity: (innerAlerts?.totalClearance || defaultAlert).severity,
      inner_mainBearings_differential: (innerAlerts?.mainBearings || defaultAlert).differential,
      inner_mainBearings_severity: (innerAlerts?.mainBearings || defaultAlert).severity,
      inner_upperConnectionBearings_differential: (
        innerAlerts?.upperConnectionBearings || defaultAlert
      ).differential,
      inner_upperConnectionBearings_severity: (innerAlerts?.upperConnectionBearings || defaultAlert)
        .severity,
      inner_wristPinToMatingPart_differential: (innerAlerts?.wristPinToMatingPart || defaultAlert)
        .differential,
      inner_wristPinToMatingPart_severity: (innerAlerts?.wristPinToMatingPart || defaultAlert)
        .severity,
      inner_wristPinToBushing_differential: (innerAlerts?.wristPinToBushing || defaultAlert)
        .differential,
      inner_wristPinToBushing_severity: (innerAlerts?.wristPinToBushing || defaultAlert).severity,
      inner_slideAdjNutToScrewSleeve_differential: (
        innerAlerts?.slideAdjNutToScrewSleeve || defaultAlert
      ).differential,
      inner_slideAdjNutToScrewSleeve_severity: (
        innerAlerts?.slideAdjNutToScrewSleeve || defaultAlert
      ).severity,
      thresholdSnapshot,
    },
  });

  return alert;
}

/**
 * Generate bearing clearance single hammer alerts for a service
 */
export async function generateBearingClearanceSingleHammerAlerts(
  prisma: PrismaClient,
  serviceId: string,
): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdBearingClearanceSingleHammer: true,
            },
          },
        },
      },
      bearingClearanceSingleHammer: {
        include: {
          data: true,
        },
      },
    },
  });

  if (!service) return null;

  const threshold = service.machine.blueprint.thresholdBearingClearanceSingleHammer;
  if (!threshold) return null;
  if (!service.bearingClearanceSingleHammer || service.bearingClearanceSingleHammer.length === 0)
    return null;

  const data = service.bearingClearanceSingleHammer[0].data;
  if (!data) return null;

  const alerts = {
    totalClearance: calculateFieldAlert(
      data.totalClearance_RH,
      data.totalClearance_LH,
      threshold.totalClearance_greenMin,
      threshold.totalClearance_yellowMin,
      threshold.totalClearance_redMin,
    ),
    mainBearings: calculateFieldAlert(
      data.mainBearings_RH,
      data.mainBearings_LH,
      threshold.mainBearings_greenMin,
      threshold.mainBearings_yellowMin,
      threshold.mainBearings_redMin,
    ),
    upperConnectionBearings: calculateFieldAlert(
      data.upperConnectionBearings_RH,
      data.upperConnectionBearings_LH,
      threshold.upperConnectionBearings_greenMin,
      threshold.upperConnectionBearings_yellowMin,
      threshold.upperConnectionBearings_redMin,
    ),
    wristPinToMatingPart: calculateFieldAlert(
      data.wristPinToMatingPart_RH,
      data.wristPinToMatingPart_LH,
      threshold.wristPinToMatingPart_greenMin,
      threshold.wristPinToMatingPart_yellowMin,
      threshold.wristPinToMatingPart_redMin,
    ),
    wristPinToBushing: calculateFieldAlert(
      data.wristPinToBushing_RH,
      data.wristPinToBushing_LH,
      threshold.wristPinToBushing_greenMin,
      threshold.wristPinToBushing_yellowMin,
      threshold.wristPinToBushing_redMin,
    ),
    slideAdjNutToScrewSleeve: calculateFieldAlert(
      data.slideAdjNutToScrewSleeve_RH,
      data.slideAdjNutToScrewSleeve_LH,
      threshold.slideAdjNutToScrewSleeve_greenMin,
      threshold.slideAdjNutToScrewSleeve_yellowMin,
      threshold.slideAdjNutToScrewSleeve_redMin,
    ),
  };

  const thresholdSnapshot = {
    blueprintId: threshold.blueprintId,
    totalClearance: {
      greenMin: threshold.totalClearance_greenMin.toNumber(),
      yellowMin: threshold.totalClearance_yellowMin.toNumber(),
      redMin: threshold.totalClearance_redMin.toNumber(),
    },
    mainBearings: {
      greenMin: threshold.mainBearings_greenMin.toNumber(),
      yellowMin: threshold.mainBearings_yellowMin.toNumber(),
      redMin: threshold.mainBearings_redMin.toNumber(),
    },
    upperConnectionBearings: {
      greenMin: threshold.upperConnectionBearings_greenMin.toNumber(),
      yellowMin: threshold.upperConnectionBearings_yellowMin.toNumber(),
      redMin: threshold.upperConnectionBearings_redMin.toNumber(),
    },
    wristPinToMatingPart: {
      greenMin: threshold.wristPinToMatingPart_greenMin.toNumber(),
      yellowMin: threshold.wristPinToMatingPart_yellowMin.toNumber(),
      redMin: threshold.wristPinToMatingPart_redMin.toNumber(),
    },
    wristPinToBushing: {
      greenMin: threshold.wristPinToBushing_greenMin.toNumber(),
      yellowMin: threshold.wristPinToBushing_yellowMin.toNumber(),
      redMin: threshold.wristPinToBushing_redMin.toNumber(),
    },
    slideAdjNutToScrewSleeve: {
      greenMin: threshold.slideAdjNutToScrewSleeve_greenMin.toNumber(),
      yellowMin: threshold.slideAdjNutToScrewSleeve_yellowMin.toNumber(),
      redMin: threshold.slideAdjNutToScrewSleeve_redMin.toNumber(),
    },
  };

  // Delete existing alert if any
  await (prisma as any).alertBearingClearanceSingleHammer.deleteMany({
    where: { machineServiceId: serviceId },
  });

  const alert = await (prisma as any).alertBearingClearanceSingleHammer.create({
    data: {
      machineService: { connect: { id: serviceId } },
      totalClearance_differential: alerts.totalClearance.differential,
      totalClearance_severity: alerts.totalClearance.severity,
      mainBearings_differential: alerts.mainBearings.differential,
      mainBearings_severity: alerts.mainBearings.severity,
      upperConnectionBearings_differential: alerts.upperConnectionBearings.differential,
      upperConnectionBearings_severity: alerts.upperConnectionBearings.severity,
      wristPinToMatingPart_differential: alerts.wristPinToMatingPart.differential,
      wristPinToMatingPart_severity: alerts.wristPinToMatingPart.severity,
      wristPinToBushing_differential: alerts.wristPinToBushing.differential,
      wristPinToBushing_severity: alerts.wristPinToBushing.severity,
      slideAdjNutToScrewSleeve_differential: alerts.slideAdjNutToScrewSleeve.differential,
      slideAdjNutToScrewSleeve_severity: alerts.slideAdjNutToScrewSleeve.severity,
      thresholdSnapshot,
    },
  });

  return alert;
}

/**
 * Generate clutch alerts for a service
 */
export async function generateClutchAlerts(prisma: PrismaClient, serviceId: string): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdClutch: true,
            },
          },
        },
      },
      clutch: {
        include: {
          data: true,
        },
      },
    },
  });

  if (!service) return null;

  const threshold = service.machine.blueprint.thresholdClutch;
  if (!threshold) return null;
  if (!service.clutch || service.clutch.length === 0) return null;

  const clutchData = service.clutch[0].data;
  if (!clutchData) return null;

  const hydClutchClearanceTotal = evaluateSingleValueAlert(
    clutchData.hydClutchClearanceTotal,
    threshold.hydClutchClearanceTotal_greenMin,
    threshold.hydClutchClearanceTotal_yellowMin,
    threshold.hydClutchClearanceTotal_redMin,
  );

  const hydClutchClearanceRear = evaluateSingleValueAlert(
    clutchData.hydClutchClearanceRear,
    threshold.hydClutchClearanceRear_greenMin,
    threshold.hydClutchClearanceRear_yellowMin,
    threshold.hydClutchClearanceRear_redMin,
  );

  const fb = evaluateSingleValueAlert(
    clutchData.brakeSpringFB,
    threshold.fb_greenMin,
    threshold.fb_yellowMin,
    threshold.fb_redMin,
  );

  const fTB = evaluateSingleValueAlert(
    clutchData.brakeSpringFTB,
    threshold.fTB_greenMin,
    threshold.fTB_yellowMin,
    threshold.fTB_redMin,
  );

  const rTB = evaluateSingleValueAlert(
    clutchData.brakeSpringRTB,
    threshold.rTB_greenMin,
    threshold.rTB_yellowMin,
    threshold.rTB_redMin,
  );

  const thresholdSnapshot = {
    blueprintId: threshold.blueprintId,
    hydClutchClearanceTotal: {
      greenMin: threshold.hydClutchClearanceTotal_greenMin.toNumber(),
      yellowMin: threshold.hydClutchClearanceTotal_yellowMin.toNumber(),
      redMin: threshold.hydClutchClearanceTotal_redMin.toNumber(),
    },
    hydClutchClearanceRear: {
      greenMin: threshold.hydClutchClearanceRear_greenMin.toNumber(),
      yellowMin: threshold.hydClutchClearanceRear_yellowMin.toNumber(),
      redMin: threshold.hydClutchClearanceRear_redMin.toNumber(),
    },
    fb: {
      greenMin: threshold.fb_greenMin.toNumber(),
      yellowMin: threshold.fb_yellowMin.toNumber(),
      redMin: threshold.fb_redMin.toNumber(),
    },
    fTB: {
      greenMin: threshold.fTB_greenMin.toNumber(),
      yellowMin: threshold.fTB_yellowMin.toNumber(),
      redMin: threshold.fTB_redMin.toNumber(),
    },
    rTB: {
      greenMin: threshold.rTB_greenMin.toNumber(),
      yellowMin: threshold.rTB_yellowMin.toNumber(),
      redMin: threshold.rTB_redMin.toNumber(),
    },
  };

  const alert = await (prisma as any).alertClutch.create({
    data: {
      machineServiceId: serviceId,
      hydClutchClearanceTotal_value: hydClutchClearanceTotal.value,
      hydClutchClearanceTotal_severity: hydClutchClearanceTotal.severity,
      hydClutchClearanceRear_value: hydClutchClearanceRear.value,
      hydClutchClearanceRear_severity: hydClutchClearanceRear.severity,
      fb_value: fb.value,
      fb_severity: fb.severity,
      fTB_value: fTB.value,
      fTB_severity: fTB.severity,
      rTB_value: rTB.value,
      rTB_severity: rTB.severity,
      thresholdSnapshot,
    },
  });

  return alert;
}

/**
 * Generate slide single hammer alerts for a service
 */
export async function generateSlideSingleHammerAlerts(
  prisma: PrismaClient,
  serviceId: string,
): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdSlideSingleHammer: true,
            },
          },
        },
      },
      slideSingleHammer: {
        include: {
          data: true,
        },
      },
    },
  });

  if (!service) return null;
  if (!service.slideSingleHammer || service.slideSingleHammer.length === 0) return null;

  const threshold = service.machine.blueprint.thresholdSlideSingleHammer;
  if (!threshold) return null;

  const slideData = service.slideSingleHammer[0];
  const alertResult = calculateSlideMaxDeviationAlert(slideData.data, threshold);

  const alert = await (prisma as any).alertSlideSingleHammer.create({
    data: {
      machineServiceId: serviceId,
      maxDeviation_differential: alertResult.differential,
      maxDeviation_severity: alertResult.severity,
      thresholdSnapshot: {
        maxDeviation_greenMin: threshold.maxDeviation_greenMin.toNumber(),
        maxDeviation_yellowMin: threshold.maxDeviation_yellowMin.toNumber(),
        maxDeviation_redMin: threshold.maxDeviation_redMin.toNumber(),
      },
    },
  });

  return alert;
}

/**
 * Generate slide double hammer alerts for a service
 */
export async function generateSlideDoubleHammerAlerts(
  prisma: PrismaClient,
  serviceId: string,
): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdSlideDoubleHammer: true,
            },
          },
        },
      },
      slideDoubleHammer: {
        include: {
          outerData: true,
          innerData: true,
        },
      },
    },
  });

  if (!service) return null;
  if (!service.slideDoubleHammer || service.slideDoubleHammer.length === 0) return null;

  const threshold = service.machine.blueprint.thresholdSlideDoubleHammer;
  if (!threshold) return null;

  const slideData = service.slideDoubleHammer[0];
  const outerAlert = calculateSlideMaxDeviationAlert(slideData.outerData, threshold);
  const innerAlert = calculateSlideMaxDeviationAlert(slideData.innerData, threshold);

  const alert = await (prisma as any).alertSlideDoubleHammer.create({
    data: {
      machineServiceId: serviceId,
      maxDeviationOuter_differential: outerAlert.differential,
      maxDeviationOuter_severity: outerAlert.severity,
      maxDeviationInner_differential: innerAlert.differential,
      maxDeviationInner_severity: innerAlert.severity,
      thresholdSnapshot: {
        maxDeviation_greenMin: threshold.maxDeviation_greenMin.toNumber(),
        maxDeviation_yellowMin: threshold.maxDeviation_yellowMin.toNumber(),
        maxDeviation_redMin: threshold.maxDeviation_redMin.toNumber(),
      },
    },
  });

  return alert;
}

/**
 * Generate gibs alerts for a service
 */
export async function generateGibsAlerts(prisma: PrismaClient, serviceId: string): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdGibs: true,
            },
          },
        },
      },
      gibs: {
        include: {
          outerData: true,
        },
      },
    },
  });

  if (!service) return null;
  if (!service.gibs || service.gibs.length === 0) return null;

  const threshold = service.machine.blueprint.thresholdGibs;
  if (!threshold) return null;

  const gibsData = service.gibs[0];
  const outerData = gibsData.outerData;
  if (!outerData) return null;

  const usableValue = calculateGibsUsable(outerData);
  if (usableValue === null) return null;

  const severity = determineSeverity(
    usableValue,
    threshold.usable_greenMin,
    threshold.usable_yellowMin,
    threshold.usable_redMin,
  );

  const alert = await (prisma as any).alertGibs.create({
    data: {
      machineServiceId: serviceId,
      usable_value: usableValue,
      usable_severity: severity,
      thresholdSnapshot: {
        usable_greenMin: threshold.usable_greenMin.toNumber(),
        usable_yellowMin: threshold.usable_yellowMin.toNumber(),
        usable_redMin: threshold.usable_redMin.toNumber(),
      },
    },
  });

  return alert;
}

/**
 * Generate pistons alerts for a service
 */
export async function generatePistonsAlerts(prisma: PrismaClient, serviceId: string): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdPistons: true,
            },
          },
        },
      },
      pistons: {
        include: {
          outerData: true,
          innerData: true,
        },
      },
    },
  });

  if (!service) return null;
  if (!service.pistons || service.pistons.length === 0) return null;

  const threshold = service.machine.blueprint.thresholdPistons;
  if (!threshold) return null;

  const pistonsData = service.pistons[0];
  const outerData = pistonsData.outerData;
  const innerData = pistonsData.innerData;

  if (!outerData && !innerData) return null;

  const outerAlerts = outerData ? calculatePistonsAlerts(outerData, threshold) : null;
  const innerAlerts = innerData ? calculatePistonsAlerts(innerData, threshold) : null;

  const defaultSeverity = AlertSeverity.NONE;

  const thresholdSnapshot = {
    difference: {
      greenMin: threshold.difference_greenMin.toNumber(),
      yellowMin: threshold.difference_yellowMin.toNumber(),
      redMin: threshold.difference_redMin.toNumber(),
    },
  };

  const alertData = {
    outer_lhLeftRight_diff: outerAlerts?.lhLeftRight.value ?? null,
    outer_lhLeftRight_severity: outerAlerts?.lhLeftRight.severity ?? defaultSeverity,
    outer_lhTopBottom_diff: outerAlerts?.lhTopBottom.value ?? null,
    outer_lhTopBottom_severity: outerAlerts?.lhTopBottom.severity ?? defaultSeverity,
    outer_rhLeftRight_diff: outerAlerts?.rhLeftRight.value ?? null,
    outer_rhLeftRight_severity: outerAlerts?.rhLeftRight.severity ?? defaultSeverity,
    outer_rhTopBottom_diff: outerAlerts?.rhTopBottom.value ?? null,
    outer_rhTopBottom_severity: outerAlerts?.rhTopBottom.severity ?? defaultSeverity,
    inner_lhLeftRight_diff: innerAlerts?.lhLeftRight.value ?? null,
    inner_lhLeftRight_severity: innerAlerts?.lhLeftRight.severity ?? defaultSeverity,
    inner_lhTopBottom_diff: innerAlerts?.lhTopBottom.value ?? null,
    inner_lhTopBottom_severity: innerAlerts?.lhTopBottom.severity ?? defaultSeverity,
    inner_rhLeftRight_diff: innerAlerts?.rhLeftRight.value ?? null,
    inner_rhLeftRight_severity: innerAlerts?.rhLeftRight.severity ?? defaultSeverity,
    inner_rhTopBottom_diff: innerAlerts?.rhTopBottom.value ?? null,
    inner_rhTopBottom_severity: innerAlerts?.rhTopBottom.severity ?? defaultSeverity,
    thresholdSnapshot,
  };

  const alert = await (prisma as any).alertPistons.create({
    data: {
      machineServiceId: serviceId,
      ...alertData,
    },
  });

  return alert;
}

/**
 * Generate tramming alerts for a service
 */
export async function generateTrammingAlerts(
  prisma: PrismaClient,
  serviceId: string,
): Promise<any> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: {
              thresholdTramming: true,
            },
          },
        },
      },
      tramming: {
        include: {
          outerData: true,
          innerData: true,
        },
      },
    },
  });

  if (!service) return null;

  const threshold = service.machine.blueprint.thresholdTramming;
  if (!threshold) return null;

  const trammingData = service.tramming[0];
  if (!trammingData) return null;

  const { outerData, innerData } = trammingData;
  if (!outerData || !innerData) return null;

  const outerAlerts = calculateTrammingSums(outerData, threshold);
  const innerAlerts = calculateTrammingSums(innerData, threshold);

  const thresholdSnapshot = {
    blueprintId: service.machine.blueprintId,
    greenMin: threshold.greenMin.toNumber(),
    yellowMin: threshold.yellowMin.toNumber(),
    redMin: threshold.redMin.toNumber(),
  };

  const alert = await (prisma as any).alertTramming.create({
    data: {
      machineServiceId: serviceId,
      outer_top_verticalSum: outerAlerts.top_verticalSum,
      outer_top_verticalSeverity: outerAlerts.top_verticalSeverity,
      outer_top_horizontalSum: outerAlerts.top_horizontalSum,
      outer_top_horizontalSeverity: outerAlerts.top_horizontalSeverity,
      outer_bottom_verticalSum: outerAlerts.bottom_verticalSum,
      outer_bottom_verticalSeverity: outerAlerts.bottom_verticalSeverity,
      outer_bottom_horizontalSum: outerAlerts.bottom_horizontalSum,
      outer_bottom_horizontalSeverity: outerAlerts.bottom_horizontalSeverity,
      outer_left_verticalSum: outerAlerts.left_verticalSum,
      outer_left_verticalSeverity: outerAlerts.left_verticalSeverity,
      outer_left_horizontalSum: outerAlerts.left_horizontalSum,
      outer_left_horizontalSeverity: outerAlerts.left_horizontalSeverity,
      outer_right_verticalSum: outerAlerts.right_verticalSum,
      outer_right_verticalSeverity: outerAlerts.right_verticalSeverity,
      outer_right_horizontalSum: outerAlerts.right_horizontalSum,
      outer_right_horizontalSeverity: outerAlerts.right_horizontalSeverity,
      inner_top_verticalSum: innerAlerts.top_verticalSum,
      inner_top_verticalSeverity: innerAlerts.top_verticalSeverity,
      inner_top_horizontalSum: innerAlerts.top_horizontalSum,
      inner_top_horizontalSeverity: innerAlerts.top_horizontalSeverity,
      inner_bottom_verticalSum: innerAlerts.bottom_verticalSum,
      inner_bottom_verticalSeverity: innerAlerts.bottom_verticalSeverity,
      inner_bottom_horizontalSum: innerAlerts.bottom_horizontalSum,
      inner_bottom_horizontalSeverity: innerAlerts.bottom_horizontalSeverity,
      inner_left_verticalSum: innerAlerts.left_verticalSum,
      inner_left_verticalSeverity: innerAlerts.left_verticalSeverity,
      inner_left_horizontalSum: innerAlerts.left_horizontalSum,
      inner_left_horizontalSeverity: innerAlerts.left_horizontalSeverity,
      inner_right_verticalSum: innerAlerts.right_verticalSum,
      inner_right_verticalSeverity: innerAlerts.right_verticalSeverity,
      inner_right_horizontalSum: innerAlerts.right_horizontalSum,
      inner_right_horizontalSeverity: innerAlerts.right_horizontalSeverity,
      thresholdSnapshot,
    },
  });

  return alert;
}
