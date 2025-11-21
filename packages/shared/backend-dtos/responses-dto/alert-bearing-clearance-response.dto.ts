import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertBearingClearanceResponseDto {
  id: string;
  machineServiceId: string;

  // Total Clearance alert
  totalClearance_RH: number;
  totalClearance_LH: number;
  totalClearance_differential: number;
  totalClearance_severity: AlertSeverity;

  // Main Bearings alert
  mainBearings_RH: number;
  mainBearings_LH: number;
  mainBearings_differential: number;
  mainBearings_severity: AlertSeverity;

  // Upper Connection Bearings alert
  upperConnectionBearings_RH: number;
  upperConnectionBearings_LH: number;
  upperConnectionBearings_differential: number;
  upperConnectionBearings_severity: AlertSeverity;

  // Wrist Pin to Mating Part alert
  wristPinToMatingPart_RH: number;
  wristPinToMatingPart_LH: number;
  wristPinToMatingPart_differential: number;
  wristPinToMatingPart_severity: AlertSeverity;

  // Wrist Pin to Bushing alert
  wristPinToBushing_RH: number;
  wristPinToBushing_LH: number;
  wristPinToBushing_differential: number;
  wristPinToBushing_severity: AlertSeverity;

  // Slide Adj Nut to Screw/Sleeve alert
  slideAdjNutToScrewSleeve_RH: number;
  slideAdjNutToScrewSleeve_LH: number;
  slideAdjNutToScrewSleeve_differential: number;
  slideAdjNutToScrewSleeve_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertBearingClearanceResponseDto> & { bearingData?: any }) {
    // Extract bearingData if present
    const { bearingData, ...alertData } = partial as any;

    // Assign alert data (differential, severity, timestamps, etc)
    Object.assign(this, alertData);

    // If bearingData is provided, extract RH/LH values from it
    if (bearingData) {
      this.totalClearance_RH =
        bearingData.totalClearance_RH?.toNumber?.() ?? bearingData.totalClearance_RH;
      this.totalClearance_LH =
        bearingData.totalClearance_LH?.toNumber?.() ?? bearingData.totalClearance_LH;

      this.mainBearings_RH =
        bearingData.mainBearings_RH?.toNumber?.() ?? bearingData.mainBearings_RH;
      this.mainBearings_LH =
        bearingData.mainBearings_LH?.toNumber?.() ?? bearingData.mainBearings_LH;

      this.upperConnectionBearings_RH =
        bearingData.upperConnectionBearings_RH?.toNumber?.() ??
        bearingData.upperConnectionBearings_RH;
      this.upperConnectionBearings_LH =
        bearingData.upperConnectionBearings_LH?.toNumber?.() ??
        bearingData.upperConnectionBearings_LH;

      this.wristPinToMatingPart_RH =
        bearingData.wristPinToMatingPart_RH?.toNumber?.() ?? bearingData.wristPinToMatingPart_RH;
      this.wristPinToMatingPart_LH =
        bearingData.wristPinToMatingPart_LH?.toNumber?.() ?? bearingData.wristPinToMatingPart_LH;

      this.wristPinToBushing_RH =
        bearingData.wristPinToBushing_RH?.toNumber?.() ?? bearingData.wristPinToBushing_RH;
      this.wristPinToBushing_LH =
        bearingData.wristPinToBushing_LH?.toNumber?.() ?? bearingData.wristPinToBushing_LH;

      this.slideAdjNutToScrewSleeve_RH =
        bearingData.slideAdjNutToScrewSleeve_RH?.toNumber?.() ??
        bearingData.slideAdjNutToScrewSleeve_RH;
      this.slideAdjNutToScrewSleeve_LH =
        bearingData.slideAdjNutToScrewSleeve_LH?.toNumber?.() ??
        bearingData.slideAdjNutToScrewSleeve_LH;
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
