export class ThresholdPistonsResponseDto {
  id: string;
  blueprintId: string;

  // Clearance thresholds (for absolute measurement values)
  clearance_greenMin: number;
  clearance_yellowMin: number;
  clearance_redMin: number;

  // Difference thresholds (for side-to-side differences)
  difference_greenMin: number;
  difference_yellowMin: number;
  difference_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdPistonsResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = [
      'clearance_greenMin',
      'clearance_yellowMin',
      'clearance_redMin',
      'difference_greenMin',
      'difference_yellowMin',
      'difference_redMin',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
