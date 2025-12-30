import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertClutchCevolaniResponseDto {
  id: string;
  machineServiceId: string;

  // Pneumatic Clutch Clearance Total alert
  pneumaticClutchClearanceTotal_value: number;
  pneumaticClutchClearanceTotal_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertClutchCevolaniResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number for value fields
    const decimalFields = ['pneumaticClutchClearanceTotal_value'];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
