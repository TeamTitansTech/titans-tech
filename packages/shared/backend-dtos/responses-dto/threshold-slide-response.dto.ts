export class ThresholdSlideResponseDto {
  id: string;
  blueprintId: string;

  // Max Deviation thresholds
  maxDeviation_greenMin: number;
  maxDeviation_yellowMin: number;
  maxDeviation_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdSlideResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = [
      'maxDeviation_greenMin',
      'maxDeviation_yellowMin',
      'maxDeviation_redMin',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
