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
} from '@titans-tech/shared/backend-dtos';
import { AlertSeverity } from '@titans-tech/shared/enums';
import { Decimal } from '@prisma/client/runtime/library';
import {
  convertThresholdToDecimal,
  convertPartialThresholdToDecimal,
  convertClutchThresholdToDecimal,
  convertPartialClutchThresholdToDecimal,
} from './threshold.utils';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async createThreshold(dto: CreateThresholdBearingClearanceDto) {
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

  // ============================================
  // CLUTCH ALERT METHODS
  // ============================================

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
      gearBacklash_greenMin:
        dto.gearBacklash_greenMin ??
        currentThreshold.gearBacklash_greenMin.toNumber(),
      gearBacklash_yellowMin:
        dto.gearBacklash_yellowMin ??
        currentThreshold.gearBacklash_yellowMin.toNumber(),
      gearBacklash_redMin:
        dto.gearBacklash_redMin ??
        currentThreshold.gearBacklash_redMin.toNumber(),
      crankEndplay_greenMin:
        dto.crankEndplay_greenMin ??
        currentThreshold.crankEndplay_greenMin.toNumber(),
      crankEndplay_yellowMin:
        dto.crankEndplay_yellowMin ??
        currentThreshold.crankEndplay_yellowMin.toNumber(),
      crankEndplay_redMin:
        dto.crankEndplay_redMin ??
        currentThreshold.crankEndplay_redMin.toNumber(),
      brakeClearance_greenMin:
        dto.brakeClearance_greenMin ??
        currentThreshold.brakeClearance_greenMin.toNumber(),
      brakeClearance_yellowMin:
        dto.brakeClearance_yellowMin ??
        currentThreshold.brakeClearance_yellowMin.toNumber(),
      brakeClearance_redMin:
        dto.brakeClearance_redMin ??
        currentThreshold.brakeClearance_redMin.toNumber(),
      hydClutchClearance_greenMin:
        dto.hydClutchClearance_greenMin ??
        currentThreshold.hydClutchClearance_greenMin.toNumber(),
      hydClutchClearance_yellowMin:
        dto.hydClutchClearance_yellowMin ??
        currentThreshold.hydClutchClearance_yellowMin.toNumber(),
      hydClutchClearance_redMin:
        dto.hydClutchClearance_redMin ??
        currentThreshold.hydClutchClearance_redMin.toNumber(),
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

    // Calculate alerts for each field
    const gearBacklash = this.calculateClutchFieldAlert(
      clutchData.gearBacklashBefore,
      clutchData.gearBacklashAfter,
      threshold.gearBacklash_greenMin,
      threshold.gearBacklash_yellowMin,
      threshold.gearBacklash_redMin,
    );

    const crankEndplay = this.calculateClutchFieldAlert(
      clutchData.crankEndplayBefore,
      clutchData.crankEndplayAfter,
      threshold.crankEndplay_greenMin,
      threshold.crankEndplay_yellowMin,
      threshold.crankEndplay_redMin,
    );

    const brakeClearance = this.calculateClutchFieldAlert(
      clutchData.brakeClearanceTotal,
      clutchData.brakeClearanceRear,
      threshold.brakeClearance_greenMin,
      threshold.brakeClearance_yellowMin,
      threshold.brakeClearance_redMin,
    );

    const hydClutchClearance = this.calculateClutchFieldAlert(
      clutchData.hydClutchClearanceTotal,
      clutchData.hydClutchClearanceRear,
      threshold.hydClutchClearance_greenMin,
      threshold.hydClutchClearance_yellowMin,
      threshold.hydClutchClearance_redMin,
    );

    const thresholdSnapshot = {
      blueprintId: threshold.blueprintId,
      gearBacklash: {
        greenMin: threshold.gearBacklash_greenMin.toNumber(),
        yellowMin: threshold.gearBacklash_yellowMin.toNumber(),
        redMin: threshold.gearBacklash_redMin.toNumber(),
      },
      crankEndplay: {
        greenMin: threshold.crankEndplay_greenMin.toNumber(),
        yellowMin: threshold.crankEndplay_yellowMin.toNumber(),
        redMin: threshold.crankEndplay_redMin.toNumber(),
      },
      brakeClearance: {
        greenMin: threshold.brakeClearance_greenMin.toNumber(),
        yellowMin: threshold.brakeClearance_yellowMin.toNumber(),
        redMin: threshold.brakeClearance_redMin.toNumber(),
      },
      hydClutchClearance: {
        greenMin: threshold.hydClutchClearance_greenMin.toNumber(),
        yellowMin: threshold.hydClutchClearance_yellowMin.toNumber(),
        redMin: threshold.hydClutchClearance_redMin.toNumber(),
      },
    };

    const alert = await this.prisma.alertClutch.upsert({
      where: { machineServiceId },
      create: {
        machineServiceId,
        gearBacklash_differential: gearBacklash.differential,
        gearBacklash_severity: gearBacklash.severity,
        crankEndplay_differential: crankEndplay.differential,
        crankEndplay_severity: crankEndplay.severity,
        brakeClearance_differential: brakeClearance.differential,
        brakeClearance_severity: brakeClearance.severity,
        hydClutchClearance_differential: hydClutchClearance.differential,
        hydClutchClearance_severity: hydClutchClearance.severity,
        thresholdSnapshot,
      },
      update: {
        gearBacklash_differential: gearBacklash.differential,
        gearBacklash_severity: gearBacklash.severity,
        crankEndplay_differential: crankEndplay.differential,
        crankEndplay_severity: crankEndplay.severity,
        brakeClearance_differential: brakeClearance.differential,
        brakeClearance_severity: brakeClearance.severity,
        hydClutchClearance_differential: hydClutchClearance.differential,
        hydClutchClearance_severity: hydClutchClearance.severity,
        thresholdSnapshot,
      },
    });

    return new AlertClutchResponseDto({
      ...alert,
      // Include clutch data for the DTO
      clutchData,
    } as any);
  }

  private calculateClutchFieldAlert(
    value1: Decimal | null,
    value2: Decimal | null,
    greenMin: Decimal,
    yellowMin: Decimal,
    redMin: Decimal,
  ) {
    // If either value is null, return NONE severity with 0 differential
    if (value1 === null || value2 === null) {
      return {
        value1: value1 || new Decimal(0),
        value2: value2 || new Decimal(0),
        differential: new Decimal(0),
        severity: AlertSeverity.NONE,
      };
    }

    // Calculate differential: |value1 - value2| using Decimal arithmetic for precision
    const differential = value1.minus(value2).abs();

    const severity = this.determineSeverity(
      differential,
      greenMin,
      yellowMin,
      redMin,
    );

    return {
      value1,
      value2,
      differential,
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
}
