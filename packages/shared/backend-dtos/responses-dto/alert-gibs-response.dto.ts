import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertGibsResponseDto {
  id: string;
  machineServiceId: string;

  // Usable alert (based on single threshold with green/yellow/red)
  usable_value: number;
  usable_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertGibsResponseDto> & { gibsData?: any }) {
    // Extract gibsData if present
    const { gibsData, ...alertData } = partial as any;

    // Assign alert data (value, severity, timestamps, etc)
    Object.assign(this, alertData);

    // Convert Decimal to number for value field
    const decimalFields = ['usable_value'];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
