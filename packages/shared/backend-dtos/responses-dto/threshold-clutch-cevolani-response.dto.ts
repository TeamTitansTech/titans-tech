export class ThresholdClutchCevolaniResponseDto {
  id: string;
  blueprintId: string;

  // Hyd Clutch Clearance Total thresholds
  hydClutchClearanceTotal_greenMin: number;
  hydClutchClearanceTotal_yellowMin: number;
  hydClutchClearanceTotal_redMin: number;

  // Hyd Clutch Clearance Rear thresholds
  hydClutchClearanceRear_greenMin: number;
  hydClutchClearanceRear_yellowMin: number;
  hydClutchClearanceRear_redMin: number;

  // F-B (Front-Back) thresholds
  fb_greenMin: number;
  fb_yellowMin: number;
  fb_redMin: number;

  // F-TB (Front Top-Bottom) thresholds
  fTB_greenMin: number;
  fTB_yellowMin: number;
  fTB_redMin: number;

  // R-TB (Rear Top-Bottom) thresholds
  rTB_greenMin: number;
  rTB_yellowMin: number;
  rTB_redMin: number;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ThresholdClutchCevolaniResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number
    const decimalFields = [
      'hydClutchClearanceTotal_greenMin',
      'hydClutchClearanceTotal_yellowMin',
      'hydClutchClearanceTotal_redMin',
      'hydClutchClearanceRear_greenMin',
      'hydClutchClearanceRear_yellowMin',
      'hydClutchClearanceRear_redMin',
      'fb_greenMin',
      'fb_yellowMin',
      'fb_redMin',
      'fTB_greenMin',
      'fTB_yellowMin',
      'fTB_redMin',
      'rTB_greenMin',
      'rTB_yellowMin',
      'rTB_redMin',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
