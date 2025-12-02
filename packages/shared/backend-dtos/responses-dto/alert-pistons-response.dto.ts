import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertPistonsResponseDto {
  id: string;
  machineServiceId: string;

  // === OUTER DATA ===
  // Difference values and severities
  outer_lhLeftRight_diff: number | null;
  outer_lhLeftRight_severity: AlertSeverity;
  outer_lhTopBottom_diff: number | null;
  outer_lhTopBottom_severity: AlertSeverity;
  outer_rhLeftRight_diff: number | null;
  outer_rhLeftRight_severity: AlertSeverity;
  outer_rhTopBottom_diff: number | null;
  outer_rhTopBottom_severity: AlertSeverity;

  // === INNER DATA ===
  // Difference values and severities
  inner_lhLeftRight_diff: number | null;
  inner_lhLeftRight_severity: AlertSeverity;
  inner_lhTopBottom_diff: number | null;
  inner_lhTopBottom_severity: AlertSeverity;
  inner_rhLeftRight_diff: number | null;
  inner_rhLeftRight_severity: AlertSeverity;
  inner_rhTopBottom_diff: number | null;
  inner_rhTopBottom_severity: AlertSeverity;

  // Threshold snapshot
  thresholdSnapshot: object | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertPistonsResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number for difference fields
    const decimalFields = [
      'outer_lhLeftRight_diff',
      'outer_lhTopBottom_diff',
      'outer_rhLeftRight_diff',
      'outer_rhTopBottom_diff',
      'inner_lhLeftRight_diff',
      'inner_lhTopBottom_diff',
      'inner_rhLeftRight_diff',
      'inner_rhTopBottom_diff',
    ];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
