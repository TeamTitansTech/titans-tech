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
} from '@titans-tech/shared';
import { AlertSeverity } from '@titans-tech/db';
import { Decimal } from '@prisma/client/runtime/library';
import {
  convertThresholdToDecimal,
  convertPartialThresholdToDecimal,
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
}
