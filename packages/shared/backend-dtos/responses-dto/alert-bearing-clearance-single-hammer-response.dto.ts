import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertBearingClearanceSingleHammerResponseDto {
  id: string;
  machineServiceId: string;

  // Single hammer alerts (no inner/outer distinction)
  totalClearance_RH: number;
  totalClearance_LH: number;
  totalClearance_differential: number;
  totalClearance_severity: AlertSeverity;

  mainBearings_RH: number;
  mainBearings_LH: number;
  mainBearings_differential: number;
  mainBearings_severity: AlertSeverity;

  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  upperConnectionBearings_differential: number;
  upperConnectionBearings_severity: AlertSeverity;

  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToMatingPart_differential: number;
  wristPinToMatingPart_severity: AlertSeverity;

  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
  wristPinToBushing_differential: number;
  wristPinToBushing_severity: AlertSeverity;

  slideAdjNutToScrewSleeve_RH: number;
  slideAdjNutToScrewSleeve_LH: number;
  slideAdjNutToScrewSleeve_differential: number;
  slideAdjNutToScrewSleeve_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(
    partial: Partial<AlertBearingClearanceSingleHammerResponseDto> & {
      data?: any;
    },
  ) {
    const { data, ...alertData } = partial as any;

    // Assign alert data (differential, severity, timestamps, etc)
    Object.assign(this, alertData);

    // Extract RH/LH values from data
    if (data) {
      this.totalClearance_RH = data.totalClearance_RH?.toNumber?.() ?? data.totalClearance_RH;
      this.totalClearance_LH = data.totalClearance_LH?.toNumber?.() ?? data.totalClearance_LH;

      this.mainBearings_RH = data.mainBearings_RH?.toNumber?.() ?? data.mainBearings_RH;
      this.mainBearings_LH = data.mainBearings_LH?.toNumber?.() ?? data.mainBearings_LH;

      this.upperConnectionBearings_RH =
        data.upperConnectionBearings_RH?.toNumber?.() ?? data.upperConnectionBearings_RH;
      this.upperConnectionBearings_LH =
        data.upperConnectionBearings_LH?.toNumber?.() ?? data.upperConnectionBearings_LH;

      this.wristPinToMatingPart_RH =
        data.wristPinToMatingPart_RH?.toNumber?.() ?? data.wristPinToMatingPart_RH;
      this.wristPinToMatingPart_LH =
        data.wristPinToMatingPart_LH?.toNumber?.() ?? data.wristPinToMatingPart_LH;

      this.wristPinToBushing_RH =
        data.wristPinToBushing_RH?.toNumber?.() ?? data.wristPinToBushing_RH;
      this.wristPinToBushing_LH =
        data.wristPinToBushing_LH?.toNumber?.() ?? data.wristPinToBushing_LH;

      this.slideAdjNutToScrewSleeve_RH =
        data.slideAdjNutToScrewSleeve_RH?.toNumber?.() ?? data.slideAdjNutToScrewSleeve_RH;
      this.slideAdjNutToScrewSleeve_LH =
        data.slideAdjNutToScrewSleeve_LH?.toNumber?.() ?? data.slideAdjNutToScrewSleeve_LH;
    }

    // Convert Decimal to number for differential fields
    const decimalFields = [
      'totalClearance_differential',
      'mainBearings_differential',
      'upperConnectionBearings_differential',
      'wristPinToMatingPart_differential',
      'wristPinToBushing_differential',
      'slideAdjNutToScrewSleeve_differential',
    ];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
