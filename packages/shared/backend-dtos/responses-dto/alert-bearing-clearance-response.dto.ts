import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertBearingClearanceResponseDto {
  id: string;
  machineServiceId: string;

  // OUTER alerts
  outer_totalClearance_RH: number;
  outer_totalClearance_LH: number;
  outer_totalClearance_differential: number;
  outer_totalClearance_severity: AlertSeverity;

  outer_mainBearings_RH: number;
  outer_mainBearings_LH: number;
  outer_mainBearings_differential: number;
  outer_mainBearings_severity: AlertSeverity;

  outer_upperConnectionBearings_RH: number;
  outer_upperConnectionBearings_LH: number;
  outer_upperConnectionBearings_differential: number;
  outer_upperConnectionBearings_severity: AlertSeverity;

  outer_wristPinToMatingPart_RH: number;
  outer_wristPinToMatingPart_LH: number;
  outer_wristPinToMatingPart_differential: number;
  outer_wristPinToMatingPart_severity: AlertSeverity;

  outer_wristPinToBushing_RH: number;
  outer_wristPinToBushing_LH: number;
  outer_wristPinToBushing_differential: number;
  outer_wristPinToBushing_severity: AlertSeverity;

  outer_slideAdjNutToScrewSleeve_RH: number;
  outer_slideAdjNutToScrewSleeve_LH: number;
  outer_slideAdjNutToScrewSleeve_differential: number;
  outer_slideAdjNutToScrewSleeve_severity: AlertSeverity;

  // INNER alerts
  inner_totalClearance_RH: number;
  inner_totalClearance_LH: number;
  inner_totalClearance_differential: number;
  inner_totalClearance_severity: AlertSeverity;

  inner_mainBearings_RH: number;
  inner_mainBearings_LH: number;
  inner_mainBearings_differential: number;
  inner_mainBearings_severity: AlertSeverity;

  inner_upperConnectionBearings_RH: number;
  inner_upperConnectionBearings_LH: number;
  inner_upperConnectionBearings_differential: number;
  inner_upperConnectionBearings_severity: AlertSeverity;

  inner_wristPinToMatingPart_RH: number;
  inner_wristPinToMatingPart_LH: number;
  inner_wristPinToMatingPart_differential: number;
  inner_wristPinToMatingPart_severity: AlertSeverity;

  inner_wristPinToBushing_RH: number;
  inner_wristPinToBushing_LH: number;
  inner_wristPinToBushing_differential: number;
  inner_wristPinToBushing_severity: AlertSeverity;

  inner_slideAdjNutToScrewSleeve_RH: number;
  inner_slideAdjNutToScrewSleeve_LH: number;
  inner_slideAdjNutToScrewSleeve_differential: number;
  inner_slideAdjNutToScrewSleeve_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(
    partial: Partial<AlertBearingClearanceResponseDto> & {
      outerData?: any;
      innerData?: any;
    },
  ) {
    const { outerData, innerData, ...alertData } = partial as any;

    // Assign alert data (differential, severity, timestamps, etc)
    Object.assign(this, alertData);

    // Extract RH/LH values from outerData
    if (outerData) {
      this.outer_totalClearance_RH =
        outerData.totalClearance_RH?.toNumber?.() ?? outerData.totalClearance_RH;
      this.outer_totalClearance_LH =
        outerData.totalClearance_LH?.toNumber?.() ?? outerData.totalClearance_LH;

      this.outer_mainBearings_RH =
        outerData.mainBearings_RH?.toNumber?.() ?? outerData.mainBearings_RH;
      this.outer_mainBearings_LH =
        outerData.mainBearings_LH?.toNumber?.() ?? outerData.mainBearings_LH;

      this.outer_upperConnectionBearings_RH =
        outerData.upperConnectionBearings_RH?.toNumber?.() ?? outerData.upperConnectionBearings_RH;
      this.outer_upperConnectionBearings_LH =
        outerData.upperConnectionBearings_LH?.toNumber?.() ?? outerData.upperConnectionBearings_LH;

      this.outer_wristPinToMatingPart_RH =
        outerData.wristPinToMatingPart_RH?.toNumber?.() ?? outerData.wristPinToMatingPart_RH;
      this.outer_wristPinToMatingPart_LH =
        outerData.wristPinToMatingPart_LH?.toNumber?.() ?? outerData.wristPinToMatingPart_LH;

      this.outer_wristPinToBushing_RH =
        outerData.wristPinToBushing_RH?.toNumber?.() ?? outerData.wristPinToBushing_RH;
      this.outer_wristPinToBushing_LH =
        outerData.wristPinToBushing_LH?.toNumber?.() ?? outerData.wristPinToBushing_LH;

      this.outer_slideAdjNutToScrewSleeve_RH =
        outerData.slideAdjNutToScrewSleeve_RH?.toNumber?.() ??
        outerData.slideAdjNutToScrewSleeve_RH;
      this.outer_slideAdjNutToScrewSleeve_LH =
        outerData.slideAdjNutToScrewSleeve_LH?.toNumber?.() ??
        outerData.slideAdjNutToScrewSleeve_LH;
    }

    // Extract RH/LH values from innerData
    if (innerData) {
      this.inner_totalClearance_RH =
        innerData.totalClearance_RH?.toNumber?.() ?? innerData.totalClearance_RH;
      this.inner_totalClearance_LH =
        innerData.totalClearance_LH?.toNumber?.() ?? innerData.totalClearance_LH;

      this.inner_mainBearings_RH =
        innerData.mainBearings_RH?.toNumber?.() ?? innerData.mainBearings_RH;
      this.inner_mainBearings_LH =
        innerData.mainBearings_LH?.toNumber?.() ?? innerData.mainBearings_LH;

      this.inner_upperConnectionBearings_RH =
        innerData.upperConnectionBearings_RH?.toNumber?.() ?? innerData.upperConnectionBearings_RH;
      this.inner_upperConnectionBearings_LH =
        innerData.upperConnectionBearings_LH?.toNumber?.() ?? innerData.upperConnectionBearings_LH;

      this.inner_wristPinToMatingPart_RH =
        innerData.wristPinToMatingPart_RH?.toNumber?.() ?? innerData.wristPinToMatingPart_RH;
      this.inner_wristPinToMatingPart_LH =
        innerData.wristPinToMatingPart_LH?.toNumber?.() ?? innerData.wristPinToMatingPart_LH;

      this.inner_wristPinToBushing_RH =
        innerData.wristPinToBushing_RH?.toNumber?.() ?? innerData.wristPinToBushing_RH;
      this.inner_wristPinToBushing_LH =
        innerData.wristPinToBushing_LH?.toNumber?.() ?? innerData.wristPinToBushing_LH;

      this.inner_slideAdjNutToScrewSleeve_RH =
        innerData.slideAdjNutToScrewSleeve_RH?.toNumber?.() ??
        innerData.slideAdjNutToScrewSleeve_RH;
      this.inner_slideAdjNutToScrewSleeve_LH =
        innerData.slideAdjNutToScrewSleeve_LH?.toNumber?.() ??
        innerData.slideAdjNutToScrewSleeve_LH;
    }

    // Convert Decimal to number for differential fields
    const decimalFields = [
      'outer_totalClearance_differential',
      'outer_mainBearings_differential',
      'outer_upperConnectionBearings_differential',
      'outer_wristPinToMatingPart_differential',
      'outer_wristPinToBushing_differential',
      'outer_slideAdjNutToScrewSleeve_differential',
      'inner_totalClearance_differential',
      'inner_mainBearings_differential',
      'inner_upperConnectionBearings_differential',
      'inner_wristPinToMatingPart_differential',
      'inner_wristPinToBushing_differential',
      'inner_slideAdjNutToScrewSleeve_differential',
    ];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
