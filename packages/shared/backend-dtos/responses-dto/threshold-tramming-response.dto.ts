export class ThresholdTrammingResponseDto {
  id: string;
  blueprintId: string;

  // Single threshold range for all tramming sums (vertical and horizontal)
  greenMin: number;
  yellowMin: number;
  redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdTrammingResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = ['greenMin', 'yellowMin', 'redMin'];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
