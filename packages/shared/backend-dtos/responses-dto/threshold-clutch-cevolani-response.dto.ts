export class ThresholdClutchCevolaniResponseDto {
  id: string;
  blueprintId: string;

  // Pneumatic Clutch Clearance Total thresholds
  pneumaticClutchClearanceTotal_greenMin: number;
  pneumaticClutchClearanceTotal_yellowMin: number;
  pneumaticClutchClearanceTotal_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdClutchCevolaniResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = [
      'pneumaticClutchClearanceTotal_greenMin',
      'pneumaticClutchClearanceTotal_yellowMin',
      'pneumaticClutchClearanceTotal_redMin',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
