export class ThresholdBearingClearanceSingleHammerResponseDto {
  id: string;
  blueprintId: string;

  // Total Clearance thresholds
  totalClearance_greenMin: number;
  totalClearance_yellowMin: number;
  totalClearance_redMin: number;

  // Main Bearings thresholds
  mainBearings_greenMin: number;
  mainBearings_yellowMin: number;
  mainBearings_redMin: number;

  // Upper Connection Bearings thresholds
  upperConnectionBearings_greenMin: number;
  upperConnectionBearings_yellowMin: number;
  upperConnectionBearings_redMin: number;

  // Wrist Pin to Mating Part thresholds
  wristPinToMatingPart_greenMin: number;
  wristPinToMatingPart_yellowMin: number;
  wristPinToMatingPart_redMin: number;

  // Wrist Pin to Bushing thresholds
  wristPinToBushing_greenMin: number;
  wristPinToBushing_yellowMin: number;
  wristPinToBushing_redMin: number;

  // Slide Adj Nut to Screw/Sleeve thresholds
  slideAdjNutToScrewSleeve_greenMin: number;
  slideAdjNutToScrewSleeve_yellowMin: number;
  slideAdjNutToScrewSleeve_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdBearingClearanceSingleHammerResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = [
      'totalClearance_greenMin',
      'totalClearance_yellowMin',
      'totalClearance_redMin',
      'mainBearings_greenMin',
      'mainBearings_yellowMin',
      'mainBearings_redMin',
      'upperConnectionBearings_greenMin',
      'upperConnectionBearings_yellowMin',
      'upperConnectionBearings_redMin',
      'wristPinToMatingPart_greenMin',
      'wristPinToMatingPart_yellowMin',
      'wristPinToMatingPart_redMin',
      'wristPinToBushing_greenMin',
      'wristPinToBushing_yellowMin',
      'wristPinToBushing_redMin',
      'slideAdjNutToScrewSleeve_greenMin',
      'slideAdjNutToScrewSleeve_yellowMin',
      'slideAdjNutToScrewSleeve_redMin',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
