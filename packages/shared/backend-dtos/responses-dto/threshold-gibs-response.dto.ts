export class ThresholdGibsResponseDto {
  id: string;
  blueprintId: string;

  // Usable thresholds
  usable_greenMin: number;
  usable_yellowMin: number;
  usable_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdGibsResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = ['usable_greenMin', 'usable_yellowMin', 'usable_redMin'];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
