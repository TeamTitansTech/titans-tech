import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertClutchCevolaniResponseDto {
  id: string;
  machineServiceId: string;

  // Hyd Clutch Clearance Total alert
  hydClutchClearanceTotal_value: number;
  hydClutchClearanceTotal_severity: AlertSeverity;

  // Hyd Clutch Clearance Rear alert
  hydClutchClearanceRear_value: number;
  hydClutchClearanceRear_severity: AlertSeverity;

  // F-B (Front-Back) alert
  fb_value: number;
  fb_severity: AlertSeverity;

  // F-TB (Front Top-Bottom) alert
  fTB_value: number;
  fTB_severity: AlertSeverity;

  // R-TB (Rear Top-Bottom) alert
  rTB_value: number;
  rTB_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertClutchCevolaniResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number for value fields
    const decimalFields = [
      'hydClutchClearanceTotal_value',
      'hydClutchClearanceRear_value',
      'fb_value',
      'fTB_value',
      'rTB_value',
    ];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
