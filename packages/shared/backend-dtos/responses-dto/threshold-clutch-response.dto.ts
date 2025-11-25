export class ThresholdClutchResponseDto {
  id: string;
  blueprintId: string;

  // Gear Backlash thresholds
  gearBacklash_greenMin: number;
  gearBacklash_yellowMin: number;
  gearBacklash_redMin: number;

  // Crank Endplay thresholds
  crankEndplay_greenMin: number;
  crankEndplay_yellowMin: number;
  crankEndplay_redMin: number;

  // Brake Clearance thresholds
  brakeClearance_greenMin: number;
  brakeClearance_yellowMin: number;
  brakeClearance_redMin: number;

  // Hydraulic Clutch Clearance thresholds
  hydClutchClearance_greenMin: number;
  hydClutchClearance_yellowMin: number;
  hydClutchClearance_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdClutchResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = [
      'gearBacklash_greenMin',
      'gearBacklash_yellowMin',
      'gearBacklash_redMin',
      'crankEndplay_greenMin',
      'crankEndplay_yellowMin',
      'crankEndplay_redMin',
      'brakeClearance_greenMin',
      'brakeClearance_yellowMin',
      'brakeClearance_redMin',
      'hydClutchClearance_greenMin',
      'hydClutchClearance_yellowMin',
      'hydClutchClearance_redMin',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
