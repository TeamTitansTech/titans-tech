import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateThresholdBearingClearanceDto,
  UpdateThresholdBearingClearanceDto,
  ThresholdBearingClearanceResponseDto,
  AlertBearingClearanceResponseDto,
  CreateThresholdBearingClearanceSchema,
  CreateThresholdClutchDto,
  UpdateThresholdClutchDto,
  ThresholdClutchResponseDto,
  AlertClutchResponseDto,
  CreateThresholdClutchSchema,
  CreateAlertCounterbalanceCylinderAirbagDto,
  UpdateAlertCounterbalanceCylinderAirbagDto,
  AlertCounterbalanceCylinderAirbagResponseDto,
  CreateThresholdSlideDto,
  UpdateThresholdSlideDto,
  ThresholdSlideResponseDto,
  AlertSlideResponseDto,
  CreateThresholdGibsDto,
  UpdateThresholdGibsDto,
  ThresholdGibsResponseDto,
  AlertGibsResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { AlertSeverity } from '@titans-tech/shared/enums';
import { Decimal } from '@prisma/client/runtime/library';
import {
  convertThresholdToDecimal,
  convertPartialThresholdToDecimal,
  convertClutchThresholdToDecimal,
  convertPartialClutchThresholdToDecimal,
  convertSlideThresholdToDecimal,
  convertPartialSlideThresholdToDecimal,
  convertGibsThresholdToDecimal,
  convertPartialGibsThresholdToDecimal,
} from './threshold.utils';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async createThreshold(dto: CreateThresholdBearingClearanceDto) {
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id: dto.blueprintId },
    });

    if (!blueprint) {
      throw new NotFoundException(`Blueprint ${dto.blueprintId} not found`);
    }

    const existingThreshold =
      await this.prisma.thresholdBearingClearance.findUnique({
        where: { blueprintId: dto.blueprintId },
      });

    if (existingThreshold) {
      throw new BadRequestException(
        `Threshold already exists for blueprint ${dto.blueprintId}. Use update instead.`,
      );
    }

    const threshold = await this.prisma.thresholdBearingClearance.create({
      data: {
        blueprintId: dto.blueprintId,
        ...convertThresholdToDecimal(dto),
      },
    });

    return new ThresholdBearingClearanceResponseDto(threshold as any);
  }

  async getThresholdByBlueprint(blueprintId: string) {
    const threshold = await this.prisma.thresholdBearingClearance.findUnique({
      where: { blueprintId },
    });

    if (!threshold) {
      throw new NotFoundException(
        `Threshold not found for blueprint ${blueprintId}`,
      );
    }

    return new ThresholdBearingClearanceResponseDto(threshold as any);
  }

  async updateThreshold(
    blueprintId: string,
    dto: UpdateThresholdBearingClearanceDto,
  ) {
    const currentThreshold =
      await this.prisma.thresholdBearingClearance.findUnique({
        where: { blueprintId },
      });

    if (!currentThreshold) {
      throw new NotFoundException(
        `Threshold not found for blueprint ${blueprintId}`,
      );
    }

    const mergedData = {
      blueprintId,
      totalClearance_greenMin:
        dto.totalClearance_greenMin ??
        currentThreshold.totalClearance_greenMin.toNumber(),
      totalClearance_yellowMin:
        dto.totalClearance_yellowMin ??
        currentThreshold.totalClearance_yellowMin.toNumber(),
      totalClearance_redMin:
        dto.totalClearance_redMin ??
        currentThreshold.totalClearance_redMin.toNumber(),
      mainBearings_greenMin:
        dto.mainBearings_greenMin ??
        currentThreshold.mainBearings_greenMin.toNumber(),
      mainBearings_yellowMin:
        dto.mainBearings_yellowMin ??
        currentThreshold.mainBearings_yellowMin.toNumber(),
      mainBearings_redMin:
        dto.mainBearings_redMin ??
        currentThreshold.mainBearings_redMin.toNumber(),
      upperConnectionBearings_greenMin:
        dto.upperConnectionBearings_greenMin ??
        currentThreshold.upperConnectionBearings_greenMin.toNumber(),
      upperConnectionBearings_yellowMin:
        dto.upperConnectionBearings_yellowMin ??
        currentThreshold.upperConnectionBearings_yellowMin.toNumber(),
      upperConnectionBearings_redMin:
        dto.upperConnectionBearings_redMin ??
        currentThreshold.upperConnectionBearings_redMin.toNumber(),
      wristPinToMatingPart_greenMin:
        dto.wristPinToMatingPart_greenMin ??
        currentThreshold.wristPinToMatingPart_greenMin.toNumber(),
      wristPinToMatingPart_yellowMin:
        dto.wristPinToMatingPart_yellowMin ??
        currentThreshold.wristPinToMatingPart_yellowMin.toNumber(),
      wristPinToMatingPart_redMin:
        dto.wristPinToMatingPart_redMin ??
        currentThreshold.wristPinToMatingPart_redMin.toNumber(),
      wristPinToBushing_greenMin:
        dto.wristPinToBushing_greenMin ??
        currentThreshold.wristPinToBushing_greenMin.toNumber(),
      wristPinToBushing_yellowMin:
        dto.wristPinToBushing_yellowMin ??
        currentThreshold.wristPinToBushing_yellowMin.toNumber(),
      wristPinToBushing_redMin:
        dto.wristPinToBushing_redMin ??
        currentThreshold.wristPinToBushing_redMin.toNumber(),
      slideAdjNutToScrewSleeve_greenMin:
        dto.slideAdjNutToScrewSleeve_greenMin ??
        currentThreshold.slideAdjNutToScrewSleeve_greenMin.toNumber(),
      slideAdjNutToScrewSleeve_yellowMin:
        dto.slideAdjNutToScrewSleeve_yellowMin ??
        currentThreshold.slideAdjNutToScrewSleeve_yellowMin.toNumber(),
      slideAdjNutToScrewSleeve_redMin:
        dto.slideAdjNutToScrewSleeve_redMin ??
        currentThreshold.slideAdjNutToScrewSleeve_redMin.toNumber(),
    };

    // 3. Validate merged data (ensures greenMin < yellowMin < redMin for all fields)
    try {
      CreateThresholdBearingClearanceSchema.parse(mergedData);
    } catch (error) {
      throw new BadRequestException(
        'Invalid threshold values: ' + error.message,
      );
    }

    // 4. Convert to Decimal and update
    const data = convertPartialThresholdToDecimal(dto);

    const threshold = await this.prisma.thresholdBearingClearance.update({
      where: { blueprintId },
      data,
    });

    return new ThresholdBearingClearanceResponseDto(threshold as any);
  }

  async deleteThreshold(blueprintId: string) {
    await this.prisma.thresholdBearingClearance.delete({
      where: { blueprintId },
    });
  }

  async generateAlertsForService(machineServiceId: string) {
    // 1. Fetch service with threshold and bearing clearance data
    const service = await this.prisma.machineService.findUnique({
      where: { id: machineServiceId },
      include: {
        machine: {
          include: {
            blueprint: {
              include: {
                thresholdBearingClearance: true,
                thresholdClutch: true,
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
        clutch: {
          include: {
            data: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const threshold = service.machine.blueprint.thresholdBearingClearance;

    if (!threshold) {
      console.log(
        '⚠️ [ALERTS] No threshold configured for this blueprint - skipping alert generation',
      );
      return null;
    }

    if (!service.bearingClearance || service.bearingClearance.length === 0) {
      console.log(
        '⚠️ [ALERTS] No bearing clearance data - skipping alert generation',
      );
      return null;
    }

    const bearingData =
      service.bearingClearance[0].outerData ||
      service.bearingClearance[0].innerData;

    if (!bearingData) {
      console.log(
        '⚠️ [ALERTS] No outerData or innerData found - skipping alert generation',
      );
      return null;
    }

    const totalClearance = this.calculateFieldAlert(
      bearingData.totalClearance_RH,
      bearingData.totalClearance_LH,
      threshold.totalClearance_greenMin,
      threshold.totalClearance_yellowMin,
      threshold.totalClearance_redMin,
    );

    const mainBearings = this.calculateFieldAlert(
      bearingData.mainBearings_RH,
      bearingData.mainBearings_LH,
      threshold.mainBearings_greenMin,
      threshold.mainBearings_yellowMin,
      threshold.mainBearings_redMin,
    );

    const upperConnectionBearings = this.calculateFieldAlert(
      bearingData.upperConnectionBearings_RH,
      bearingData.upperConnectionBearings_LH,
      threshold.upperConnectionBearings_greenMin,
      threshold.upperConnectionBearings_yellowMin,
      threshold.upperConnectionBearings_redMin,
    );

    const wristPinToMatingPart = this.calculateFieldAlert(
      bearingData.wristPinToMatingPart_RH,
      bearingData.wristPinToMatingPart_LH,
      threshold.wristPinToMatingPart_greenMin,
      threshold.wristPinToMatingPart_yellowMin,
      threshold.wristPinToMatingPart_redMin,
    );

    const wristPinToBushing = this.calculateFieldAlert(
      bearingData.wristPinToBushing_RH,
      bearingData.wristPinToBushing_LH,
      threshold.wristPinToBushing_greenMin,
      threshold.wristPinToBushing_yellowMin,
      threshold.wristPinToBushing_redMin,
    );

    const slideAdjNutToScrewSleeve = this.calculateFieldAlert(
      bearingData.slideAdjNutToScrewSleeve_RH,
      bearingData.slideAdjNutToScrewSleeve_LH,
      threshold.slideAdjNutToScrewSleeve_greenMin,
      threshold.slideAdjNutToScrewSleeve_yellowMin,
      threshold.slideAdjNutToScrewSleeve_redMin,
    );

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

    const alert = await this.prisma.alertBearingClearance.upsert({
      where: { machineServiceId },
      create: {
        machineServiceId,
        totalClearance_differential: totalClearance.differential,
        totalClearance_severity: totalClearance.severity,
        mainBearings_differential: mainBearings.differential,
        mainBearings_severity: mainBearings.severity,
        upperConnectionBearings_differential:
          upperConnectionBearings.differential,
        upperConnectionBearings_severity: upperConnectionBearings.severity,
        wristPinToMatingPart_differential: wristPinToMatingPart.differential,
        wristPinToMatingPart_severity: wristPinToMatingPart.severity,
        wristPinToBushing_differential: wristPinToBushing.differential,
        wristPinToBushing_severity: wristPinToBushing.severity,
        slideAdjNutToScrewSleeve_differential:
          slideAdjNutToScrewSleeve.differential,
        slideAdjNutToScrewSleeve_severity: slideAdjNutToScrewSleeve.severity,
        thresholdSnapshot,
      },
      update: {
        totalClearance_differential: totalClearance.differential,
        totalClearance_severity: totalClearance.severity,
        mainBearings_differential: mainBearings.differential,
        mainBearings_severity: mainBearings.severity,
        upperConnectionBearings_differential:
          upperConnectionBearings.differential,
        upperConnectionBearings_severity: upperConnectionBearings.severity,
        wristPinToMatingPart_differential: wristPinToMatingPart.differential,
        wristPinToMatingPart_severity: wristPinToMatingPart.severity,
        wristPinToBushing_differential: wristPinToBushing.differential,
        wristPinToBushing_severity: wristPinToBushing.severity,
        slideAdjNutToScrewSleeve_differential:
          slideAdjNutToScrewSleeve.differential,
        slideAdjNutToScrewSleeve_severity: slideAdjNutToScrewSleeve.severity,
        thresholdSnapshot,
      },
    });

    // Also generate clutch alerts if clutch data exists
    if (service.clutch && service.clutch.length > 0) {
      const clutchThreshold = service.machine.blueprint.thresholdClutch;
      const clutchData = service.clutch[0].data;

      if (clutchThreshold && clutchData) {
        await this.generateClutchAlertsForService(machineServiceId);
      }
    }

    return new AlertBearingClearanceResponseDto({
      ...alert,
      // Include bearing data for the DTO
      bearingData,
    } as any);
  }

  private calculateFieldAlert(
    RH: Decimal,
    LH: Decimal,
    greenMin: Decimal,
    yellowMin: Decimal,
    redMin: Decimal,
  ) {
    // Calculate differential: |RH - LH| using Decimal arithmetic for precision
    const differential = RH.minus(LH).abs();

    const severity = this.determineSeverity(
      differential,
      greenMin,
      yellowMin,
      redMin,
    );

    return {
      RH,
      LH,
      differential,
      severity,
    };
  }

  private determineSeverity(
    differential: Decimal,
    greenMin: Decimal,
    yellowMin: Decimal,
    redMin: Decimal,
  ): AlertSeverity {
    if (
      differential.greaterThanOrEqualTo(greenMin) &&
      differential.lessThan(yellowMin)
    ) {
      return AlertSeverity.GREEN;
    } else if (
      differential.greaterThanOrEqualTo(yellowMin) &&
      differential.lessThan(redMin)
    ) {
      return AlertSeverity.YELLOW;
    } else if (differential.greaterThanOrEqualTo(redMin)) {
      return AlertSeverity.RED;
    } else {
      return AlertSeverity.NONE;
    }
  }

  async getAlertByService(machineServiceId: string) {
    const alert = await this.prisma.alertBearingClearance.findUnique({
      where: { machineServiceId },
      include: {
        machineService: {
          include: {
            bearingClearance: {
              include: {
                outerData: true,
                innerData: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(
        `Alert not found for service ${machineServiceId}`,
      );
    }

    const bearingData =
      alert.machineService.bearingClearance[0]?.outerData ||
      alert.machineService.bearingClearance[0]?.innerData;

    if (!bearingData) {
      throw new NotFoundException(
        `Bearing clearance data not found for service ${machineServiceId}`,
      );
    }

    return new AlertBearingClearanceResponseDto({
      ...alert,
      bearingData,
    } as any);
  }

  async createClutchThreshold(dto: CreateThresholdClutchDto) {
    const threshold = await this.prisma.thresholdClutch.create({
      data: {
        blueprintId: dto.blueprintId,
        ...convertClutchThresholdToDecimal(dto),
      },
    });

    return new ThresholdClutchResponseDto(threshold as any);
  }

  async getClutchThresholdByBlueprint(blueprintId: string) {
    const threshold = await this.prisma.thresholdClutch.findUnique({
      where: { blueprintId },
    });

    if (!threshold) {
      throw new NotFoundException(
        `Clutch threshold not found for blueprint ${blueprintId}`,
      );
    }

    return new ThresholdClutchResponseDto(threshold as any);
  }

  async updateClutchThreshold(
    blueprintId: string,
    dto: UpdateThresholdClutchDto,
  ) {
    const currentThreshold = await this.prisma.thresholdClutch.findUnique({
      where: { blueprintId },
    });

    if (!currentThreshold) {
      throw new NotFoundException(
        `Clutch threshold not found for blueprint ${blueprintId}`,
      );
    }

    const mergedData = {
      blueprintId,
      // Hyd Clutch Clearance Total
      hydClutchClearanceTotal_greenMin:
        dto.hydClutchClearanceTotal_greenMin ??
        currentThreshold.hydClutchClearanceTotal_greenMin.toNumber(),
      hydClutchClearanceTotal_yellowMin:
        dto.hydClutchClearanceTotal_yellowMin ??
        currentThreshold.hydClutchClearanceTotal_yellowMin.toNumber(),
      hydClutchClearanceTotal_redMin:
        dto.hydClutchClearanceTotal_redMin ??
        currentThreshold.hydClutchClearanceTotal_redMin.toNumber(),
      // Hyd Clutch Clearance Rear
      hydClutchClearanceRear_greenMin:
        dto.hydClutchClearanceRear_greenMin ??
        currentThreshold.hydClutchClearanceRear_greenMin.toNumber(),
      hydClutchClearanceRear_yellowMin:
        dto.hydClutchClearanceRear_yellowMin ??
        currentThreshold.hydClutchClearanceRear_yellowMin.toNumber(),
      hydClutchClearanceRear_redMin:
        dto.hydClutchClearanceRear_redMin ??
        currentThreshold.hydClutchClearanceRear_redMin.toNumber(),
      // F-B
      fb_greenMin: dto.fb_greenMin ?? currentThreshold.fb_greenMin.toNumber(),
      fb_yellowMin:
        dto.fb_yellowMin ?? currentThreshold.fb_yellowMin.toNumber(),
      fb_redMin: dto.fb_redMin ?? currentThreshold.fb_redMin.toNumber(),
      // F-TB
      fTB_greenMin:
        dto.fTB_greenMin ?? currentThreshold.fTB_greenMin.toNumber(),
      fTB_yellowMin:
        dto.fTB_yellowMin ?? currentThreshold.fTB_yellowMin.toNumber(),
      fTB_redMin: dto.fTB_redMin ?? currentThreshold.fTB_redMin.toNumber(),
      // R-TB
      rTB_greenMin:
        dto.rTB_greenMin ?? currentThreshold.rTB_greenMin.toNumber(),
      rTB_yellowMin:
        dto.rTB_yellowMin ?? currentThreshold.rTB_yellowMin.toNumber(),
      rTB_redMin: dto.rTB_redMin ?? currentThreshold.rTB_redMin.toNumber(),
    };

    // Validate merged data (ensures greenMin < yellowMin < redMin for all fields)
    try {
      CreateThresholdClutchSchema.parse(mergedData);
    } catch (error) {
      throw new BadRequestException(
        'Invalid clutch threshold values: ' + error.message,
      );
    }

    // Convert to Decimal and update
    const data = convertPartialClutchThresholdToDecimal(dto);

    const threshold = await this.prisma.thresholdClutch.update({
      where: { blueprintId },
      data,
    });

    return new ThresholdClutchResponseDto(threshold as any);
  }

  async deleteClutchThreshold(blueprintId: string) {
    await this.prisma.thresholdClutch.delete({
      where: { blueprintId },
    });
  }

  async generateClutchAlertsForService(machineServiceId: string) {
    // 1. Fetch service with threshold and clutch data
    const service = await this.prisma.machineService.findUnique({
      where: { id: machineServiceId },
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

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const threshold = service.machine.blueprint.thresholdClutch;

    if (!threshold) {
      console.log(
        '⚠️ [CLUTCH ALERTS] No threshold configured for this blueprint - skipping alert generation',
      );
      return null;
    }

    if (!service.clutch || service.clutch.length === 0) {
      console.log(
        '⚠️ [CLUTCH ALERTS] No clutch data - skipping alert generation',
      );
      return null;
    }

    const clutchData = service.clutch[0].data;

    if (!clutchData) {
      console.log(
        '⚠️ [CLUTCH ALERTS] No clutch measurement data found - skipping alert generation',
      );
      return null;
    }

    // Calculate alerts for each of the 5 measurement points
    const hydClutchClearanceTotal = this.evaluateSingleValueAlert(
      clutchData.hydClutchClearanceTotal,
      threshold.hydClutchClearanceTotal_greenMin,
      threshold.hydClutchClearanceTotal_yellowMin,
      threshold.hydClutchClearanceTotal_redMin,
    );

    const hydClutchClearanceRear = this.evaluateSingleValueAlert(
      clutchData.hydClutchClearanceRear,
      threshold.hydClutchClearanceRear_greenMin,
      threshold.hydClutchClearanceRear_yellowMin,
      threshold.hydClutchClearanceRear_redMin,
    );

    const fb = this.evaluateSingleValueAlert(
      clutchData.brakeSpringFB,
      threshold.fb_greenMin,
      threshold.fb_yellowMin,
      threshold.fb_redMin,
    );

    const fTB = this.evaluateSingleValueAlert(
      clutchData.brakeSpringFTB,
      threshold.fTB_greenMin,
      threshold.fTB_yellowMin,
      threshold.fTB_redMin,
    );

    const rTB = this.evaluateSingleValueAlert(
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

    const alert = await this.prisma.alertClutch.upsert({
      where: { machineServiceId },
      create: {
        machineServiceId,
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
      update: {
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

    return new AlertClutchResponseDto({
      ...alert,
      // Include clutch data for the DTO
      clutchData,
    } as any);
  }

  /**
   * Evaluates a single measurement value against thresholds
   * Used for clutch measurements (no before/after comparison needed)
   */
  private evaluateSingleValueAlert(
    value: Decimal | null,
    greenMin: Decimal,
    yellowMin: Decimal,
    redMin: Decimal,
  ): { value: Decimal; severity: AlertSeverity } {
    // If value is null, return NONE severity with 0
    if (value === null) {
      return {
        value: new Decimal(0),
        severity: AlertSeverity.NONE,
      };
    }

    // Compare single value directly against thresholds
    const severity = this.determineSeverity(value, greenMin, yellowMin, redMin);

    return {
      value,
      severity,
    };
  }

  async getClutchAlertByService(machineServiceId: string) {
    const alert = await this.prisma.alertClutch.findUnique({
      where: { machineServiceId },
      include: {
        machineService: {
          include: {
            clutch: {
              include: {
                data: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(
        `Clutch alert not found for service ${machineServiceId}`,
      );
    }

    const clutchData = alert.machineService.clutch[0]?.data;

    if (!clutchData) {
      throw new NotFoundException(
        `Clutch data not found for service ${machineServiceId}`,
      );
    }

    return new AlertClutchResponseDto({
      ...alert,
      clutchData,
    } as any);
  }

  // ============================================================================
  // COUNTERBALANCE CYLINDER AIRBAG ALERTS (Manual, User-Created)
  // ============================================================================

  /**
   * Creates a manual counterbalance cylinder airbag alert
   * @param machineServiceId - The service ID to attach the alert to
   * @param dto - Alert data (fieldName + justification)
   * @returns Created alert
   * @throws BadRequestException if alert for this field already exists
   * @throws NotFoundException if service doesn't exist
   */
  async createCounterbalanceAlert(
    machineServiceId: string,
    dto: CreateAlertCounterbalanceCylinderAirbagDto,
  ) {
    // Verify service exists
    const service = await this.prisma.machineService.findUnique({
      where: { id: machineServiceId },
    });

    if (!service) {
      throw new NotFoundException(`Service ${machineServiceId} not found`);
    }

    // Check if alert for this field already exists (unique constraint)
    const existingAlert =
      await this.prisma.alertCounterbalanceCylinderAirbag.findUnique({
        where: {
          machineServiceId_fieldName: {
            machineServiceId,
            fieldName: dto.fieldName,
          },
        },
      });

    if (existingAlert) {
      throw new BadRequestException(
        `Alert for field ${dto.fieldName} already exists for this service`,
      );
    }

    // Create alert
    const alert = await this.prisma.alertCounterbalanceCylinderAirbag.create({
      data: {
        machineServiceId,
        fieldName: dto.fieldName,
        justification: dto.justification,
      },
    });

    return new AlertCounterbalanceCylinderAirbagResponseDto(alert);
  }

  /**
   * Gets all counterbalance cylinder airbag alerts for a service
   * @param machineServiceId - The service ID
   * @returns Array of alerts (can be empty)
   */
  async getCounterbalanceAlertsForService(machineServiceId: string) {
    const alerts = await this.prisma.alertCounterbalanceCylinderAirbag.findMany(
      {
        where: { machineServiceId },
        orderBy: { createdAt: 'desc' },
      },
    );

    return alerts.map(
      (alert) => new AlertCounterbalanceCylinderAirbagResponseDto(alert),
    );
  }

  /**
   * Updates the justification of a counterbalance cylinder airbag alert
   * @param alertId - The alert ID
   * @param dto - Update data (justification only)
   * @returns Updated alert
   * @throws NotFoundException if alert doesn't exist
   */
  async updateCounterbalanceAlert(
    alertId: string,
    dto: UpdateAlertCounterbalanceCylinderAirbagDto,
  ) {
    // Verify alert exists
    const existingAlert =
      await this.prisma.alertCounterbalanceCylinderAirbag.findUnique({
        where: { id: alertId },
      });

    if (!existingAlert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }

    // Update justification only (fieldName is immutable)
    const alert = await this.prisma.alertCounterbalanceCylinderAirbag.update({
      where: { id: alertId },
      data: { justification: dto.justification },
    });

    return new AlertCounterbalanceCylinderAirbagResponseDto(alert);
  }

  /**
   * Deletes a counterbalance cylinder airbag alert
   * @param alertId - The alert ID
   * @throws NotFoundException if alert doesn't exist
   */
  async deleteCounterbalanceAlert(alertId: string) {
    // Verify alert exists
    const alert =
      await this.prisma.alertCounterbalanceCylinderAirbag.findUnique({
        where: { id: alertId },
      });

    if (!alert) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }

    await this.prisma.alertCounterbalanceCylinderAirbag.delete({
      where: { id: alertId },
    });

    return { message: 'Alert deleted successfully' };
  }

  // ==================== SLIDE THRESHOLD METHODS ====================

  async createSlideThreshold(dto: CreateThresholdSlideDto) {
    // Validate blueprint exists
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id: dto.blueprintId },
    });

    if (!blueprint) {
      throw new NotFoundException(`Blueprint ${dto.blueprintId} not found`);
    }

    // Check if threshold already exists for this blueprint
    const existingThreshold = await this.prisma.thresholdSlide.findUnique({
      where: { blueprintId: dto.blueprintId },
    });

    if (existingThreshold) {
      throw new BadRequestException(
        `Slide threshold already exists for blueprint ${dto.blueprintId}. Use update instead.`,
      );
    }

    const threshold = await this.prisma.thresholdSlide.create({
      data: {
        blueprintId: dto.blueprintId,
        ...convertSlideThresholdToDecimal(dto),
      },
    });

    return new ThresholdSlideResponseDto(threshold as any);
  }

  async getSlideThresholdByBlueprint(blueprintId: string) {
    const threshold = await this.prisma.thresholdSlide.findUnique({
      where: { blueprintId },
    });

    if (!threshold) {
      throw new NotFoundException(
        `Slide threshold not found for blueprint ${blueprintId}`,
      );
    }

    return new ThresholdSlideResponseDto(threshold as any);
  }

  async updateSlideThreshold(
    blueprintId: string,
    dto: UpdateThresholdSlideDto,
  ) {
    // Check if threshold exists
    const existingThreshold = await this.prisma.thresholdSlide.findUnique({
      where: { blueprintId },
    });

    if (!existingThreshold) {
      throw new NotFoundException(
        `Slide threshold not found for blueprint ${blueprintId}`,
      );
    }

    // Validate that yellowMin > greenMin and redMin > yellowMin if all fields provided
    const mergedData = {
      ...existingThreshold,
      ...dto,
    };

    const greenMin = Number(mergedData.maxDeviation_greenMin);
    const yellowMin = Number(mergedData.maxDeviation_yellowMin);
    const redMin = Number(mergedData.maxDeviation_redMin);

    if (yellowMin <= greenMin || redMin <= yellowMin) {
      throw new BadRequestException(
        'Invalid threshold values: must have greenMin < yellowMin < redMin',
      );
    }

    // Update threshold
    const threshold = await this.prisma.thresholdSlide.update({
      where: { blueprintId },
      data: convertPartialSlideThresholdToDecimal(dto),
    });

    return new ThresholdSlideResponseDto(threshold as any);
  }

  async deleteSlideThreshold(blueprintId: string) {
    const threshold = await this.prisma.thresholdSlide.findUnique({
      where: { blueprintId },
    });

    if (!threshold) {
      throw new NotFoundException(
        `Slide threshold not found for blueprint ${blueprintId}`,
      );
    }

    await this.prisma.thresholdSlide.delete({
      where: { blueprintId },
    });

    return { message: 'Slide threshold deleted successfully' };
  }

  // ==================== SLIDE ALERT GENERATION ====================

  async generateAlertsForSlide(serviceId: string) {
    // Fetch service with slide data and blueprint with thresholds
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: {
        machine: {
          include: {
            blueprint: {
              include: {
                thresholdSlide: true,
              },
            },
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    if (!service.slide || service.slide.length === 0) {
      throw new NotFoundException(
        `Slide data not found for service ${serviceId}`,
      );
    }

    const threshold = service.machine.blueprint.thresholdSlide;

    if (!threshold) {
      throw new NotFoundException(
        `Slide threshold not found for blueprint ${service.machine.blueprint.id}`,
      );
    }

    const slideData = service.slide[0];

    // Calculate max deviation for outer and inner
    const outerAlert = this.calculateSlideMaxDeviationAlert(
      slideData.outerData,
      threshold,
    );

    const innerAlert = this.calculateSlideMaxDeviationAlert(
      slideData.innerData,
      threshold,
    );

    // Upsert alert
    const alert = await this.prisma.alertSlide.upsert({
      where: { machineServiceId: serviceId },
      create: {
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
      update: {
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

    return new AlertSlideResponseDto({
      ...alert,
      slideData: {
        outer: slideData.outerData,
        inner: slideData.innerData,
      },
    } as any);
  }

  /**
   * Calculates max deviation from 5 position measurements
   */
  private calculateSlideMaxDeviationAlert(
    data: any,
    threshold: any,
  ): { differential: Decimal; severity: AlertSeverity } {
    if (!data) {
      return {
        differential: new Decimal(0),
        severity: AlertSeverity.NONE,
      };
    }

    // Get all 5 positions
    const positions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
    ].filter((p) => p !== null && p !== undefined);

    if (positions.length === 0) {
      return {
        differential: new Decimal(0),
        severity: AlertSeverity.NONE,
      };
    }

    // Calculate max deviation (max - min)
    const max = Decimal.max(...positions);
    const min = Decimal.min(...positions);
    const differential = max.minus(min).abs();

    // Determine severity
    const severity = this.determineSeverity(
      differential,
      threshold.maxDeviation_greenMin,
      threshold.maxDeviation_yellowMin,
      threshold.maxDeviation_redMin,
    );

    return { differential, severity };
  }

  async getSlideAlertByService(machineServiceId: string) {
    const alert = await this.prisma.alertSlide.findUnique({
      where: { machineServiceId },
      include: {
        machineService: {
          include: {
            slide: {
              include: {
                outerData: true,
                innerData: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(
        `Slide alert not found for service ${machineServiceId}`,
      );
    }

    const slideData = alert.machineService.slide[0];

    if (!slideData) {
      throw new NotFoundException(
        `Slide data not found for service ${machineServiceId}`,
      );
    }

    return new AlertSlideResponseDto({
      ...alert,
      slideData: {
        outer: slideData.outerData,
        inner: slideData.innerData,
      },
    } as any);
  }

  // ==================== GIBS THRESHOLD METHODS ====================

  async createGibsThreshold(dto: CreateThresholdGibsDto) {
    // Validate blueprint exists
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id: dto.blueprintId },
    });

    if (!blueprint) {
      throw new NotFoundException(`Blueprint ${dto.blueprintId} not found`);
    }

    // Check if threshold already exists for this blueprint
    const existingThreshold = await this.prisma.thresholdGibs.findUnique({
      where: { blueprintId: dto.blueprintId },
    });

    if (existingThreshold) {
      throw new BadRequestException(
        `GIBS threshold already exists for blueprint ${dto.blueprintId}. Use update instead.`,
      );
    }

    const threshold = await this.prisma.thresholdGibs.create({
      data: {
        blueprintId: dto.blueprintId,
        ...convertGibsThresholdToDecimal(dto),
      },
    });

    return new ThresholdGibsResponseDto(threshold as any);
  }

  async getGibsThresholdByBlueprint(blueprintId: string) {
    const threshold = await this.prisma.thresholdGibs.findUnique({
      where: { blueprintId },
    });

    if (!threshold) {
      throw new NotFoundException(
        `GIBS threshold not found for blueprint ${blueprintId}`,
      );
    }

    return new ThresholdGibsResponseDto(threshold as any);
  }

  async updateGibsThreshold(blueprintId: string, dto: UpdateThresholdGibsDto) {
    // Check if threshold exists
    const existingThreshold = await this.prisma.thresholdGibs.findUnique({
      where: { blueprintId },
    });

    if (!existingThreshold) {
      throw new NotFoundException(
        `GIBS threshold not found for blueprint ${blueprintId}`,
      );
    }

    // Validate that yellowMin > greenMin and redMin > yellowMin if all fields provided
    const mergedData = {
      ...existingThreshold,
      ...dto,
    };

    const greenMin = Number(mergedData.usable_greenMin);
    const yellowMin = Number(mergedData.usable_yellowMin);
    const redMin = Number(mergedData.usable_redMin);

    if (yellowMin <= greenMin || redMin <= yellowMin) {
      throw new BadRequestException(
        'Invalid threshold values: must have greenMin < yellowMin < redMin',
      );
    }

    // Update threshold
    const threshold = await this.prisma.thresholdGibs.update({
      where: { blueprintId },
      data: convertPartialGibsThresholdToDecimal(dto),
    });

    return new ThresholdGibsResponseDto(threshold as any);
  }

  async deleteGibsThreshold(blueprintId: string) {
    const threshold = await this.prisma.thresholdGibs.findUnique({
      where: { blueprintId },
    });

    if (!threshold) {
      throw new NotFoundException(
        `GIBS threshold not found for blueprint ${blueprintId}`,
      );
    }

    await this.prisma.thresholdGibs.delete({
      where: { blueprintId },
    });

    return { message: 'GIBS threshold deleted successfully' };
  }

  // ==================== GIBS ALERT GENERATION ====================

  async generateAlertsForGibs(serviceId: string) {
    // Fetch service with GIBS data and blueprint with thresholds
    const service = await this.prisma.machineService.findUnique({
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

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    if (!service.gibs || service.gibs.length === 0) {
      throw new NotFoundException(
        `GIBS data not found for service ${serviceId}`,
      );
    }

    const threshold = service.machine.blueprint.thresholdGibs;

    if (!threshold) {
      throw new NotFoundException(
        `GIBS threshold not found for blueprint ${service.machine.blueprint.id}`,
      );
    }

    const gibsData = service.gibs[0];
    const outerData = gibsData.outerData;

    if (!outerData) {
      throw new NotFoundException(
        `Outer Data (After Adjustment) not found for service ${serviceId}`,
      );
    }

    // Calculate usable value from outerData (Left to Right measurement)
    const usableValue = this.calculateGibsUsable(outerData);

    if (usableValue === null) {
      throw new BadRequestException(
        `Cannot calculate usable value from GIBS data`,
      );
    }

    // Determine severity
    const severity = this.determineSeverity(
      usableValue,
      threshold.usable_greenMin,
      threshold.usable_yellowMin,
      threshold.usable_redMin,
    );

    // Upsert alert
    const alert = await this.prisma.alertGibs.upsert({
      where: { machineServiceId: serviceId },
      create: {
        machineServiceId: serviceId,
        usable_value: usableValue,
        usable_severity: severity,
        thresholdSnapshot: {
          usable_greenMin: threshold.usable_greenMin.toNumber(),
          usable_yellowMin: threshold.usable_yellowMin.toNumber(),
          usable_redMin: threshold.usable_redMin.toNumber(),
        },
      },
      update: {
        usable_value: usableValue,
        usable_severity: severity,
        thresholdSnapshot: {
          usable_greenMin: threshold.usable_greenMin.toNumber(),
          usable_yellowMin: threshold.usable_yellowMin.toNumber(),
          usable_redMin: threshold.usable_redMin.toNumber(),
        },
      },
    });

    return new AlertGibsResponseDto({
      ...alert,
      gibsData: outerData,
    } as any);
  }

  /**
   * Calculates the "usable" value from GIBS outerData (After Adjustment) data
   * Based on the gibsCalculations.ts logic for Left to Right measurements
   */
  private calculateGibsUsable(data: any): Decimal | null {
    const toNum = (val: any): number =>
      val && typeof val.toNumber === 'function'
        ? val.toNumber()
        : Number(val) || 0;
    const isNum = (val: any): boolean => {
      const num =
        val && typeof val.toNumber === 'function'
          ? val.toNumber()
          : Number(val);
      return typeof num === 'number' && !isNaN(num);
    };

    // All 8 points for usable: 13, 9, 14, 10, 15, 16, 11, 12
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

    // Back points: 13, 14, 15, 16
    const backPointsCount = [
      data.point13,
      data.point14,
      data.point15,
      data.point16,
    ].filter(isNum).length;

    // Front points: 9, 11, 10, 12
    const frontPointsCount = [
      data.point9,
      data.point11,
      data.point10,
      data.point12,
    ].filter(isNum).length;

    let usable: number | null = null;

    // Excel formula logic:
    // IF(COUNT(13,9,14,10,15,16,11,12)=8, MIN(13,9,15,11)+MIN(14,10,16,12),
    //   IF(COUNT(13,14,15,16)=4, MIN(13,15)+MIN(14,16),
    //     IF(COUNT(9,11,10,12)=4, MIN(9,11)+MIN(10,12), "")))
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

  async getGibsAlertByService(machineServiceId: string) {
    const alert = await this.prisma.alertGibs.findUnique({
      where: { machineServiceId },
      include: {
        machineService: {
          include: {
            gibs: {
              include: {
                outerData: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(
        `GIBS alert not found for service ${machineServiceId}`,
      );
    }

    const gibsData = alert.machineService.gibs[0]?.outerData;

    if (!gibsData) {
      throw new NotFoundException(
        `GIBS data not found for service ${machineServiceId}`,
      );
    }

    return new AlertGibsResponseDto({
      ...alert,
      gibsData,
    } as any);
  }
}
