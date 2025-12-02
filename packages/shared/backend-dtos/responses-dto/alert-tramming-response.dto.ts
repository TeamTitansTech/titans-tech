import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertTrammingResponseDto {
  id: string;
  machineServiceId: string;

  // OUTER alerts - 4 positions × 2 directions = 8 sums
  outer_top_verticalSum: number;
  outer_top_verticalSeverity: AlertSeverity;
  outer_top_horizontalSum: number;
  outer_top_horizontalSeverity: AlertSeverity;

  outer_bottom_verticalSum: number;
  outer_bottom_verticalSeverity: AlertSeverity;
  outer_bottom_horizontalSum: number;
  outer_bottom_horizontalSeverity: AlertSeverity;

  outer_left_verticalSum: number;
  outer_left_verticalSeverity: AlertSeverity;
  outer_left_horizontalSum: number;
  outer_left_horizontalSeverity: AlertSeverity;

  outer_right_verticalSum: number;
  outer_right_verticalSeverity: AlertSeverity;
  outer_right_horizontalSum: number;
  outer_right_horizontalSeverity: AlertSeverity;

  // INNER alerts - 4 positions × 2 directions = 8 sums
  inner_top_verticalSum: number;
  inner_top_verticalSeverity: AlertSeverity;
  inner_top_horizontalSum: number;
  inner_top_horizontalSeverity: AlertSeverity;

  inner_bottom_verticalSum: number;
  inner_bottom_verticalSeverity: AlertSeverity;
  inner_bottom_horizontalSum: number;
  inner_bottom_horizontalSeverity: AlertSeverity;

  inner_left_verticalSum: number;
  inner_left_verticalSeverity: AlertSeverity;
  inner_left_horizontalSum: number;
  inner_left_horizontalSeverity: AlertSeverity;

  inner_right_verticalSum: number;
  inner_right_verticalSeverity: AlertSeverity;
  inner_right_horizontalSum: number;
  inner_right_horizontalSeverity: AlertSeverity;

  thresholdSnapshot?: any;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertTrammingResponseDto>) {
    Object.assign(this, partial);

    // Convert Decimal to number for all sum fields
    const decimalFields = [
      'outer_top_verticalSum',
      'outer_top_horizontalSum',
      'outer_bottom_verticalSum',
      'outer_bottom_horizontalSum',
      'outer_left_verticalSum',
      'outer_left_horizontalSum',
      'outer_right_verticalSum',
      'outer_right_horizontalSum',
      'inner_top_verticalSum',
      'inner_top_horizontalSum',
      'inner_bottom_verticalSum',
      'inner_bottom_horizontalSum',
      'inner_left_verticalSum',
      'inner_left_horizontalSum',
      'inner_right_verticalSum',
      'inner_right_horizontalSum',
    ];

    decimalFields.forEach((field) => {
      const value = (partial as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
