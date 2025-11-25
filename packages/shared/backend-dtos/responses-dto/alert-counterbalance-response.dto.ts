import { CounterbalanceAlertField } from '@titans-tech/db/enums';

/**
 * Response DTO for counterbalance cylinder airbag manual alerts
 * Simpler than bearing clearance alerts - no calculations or differentials
 */
export class AlertCounterbalanceCylinderAirbagResponseDto {
  id: string;
  machineServiceId: string;
  fieldName: CounterbalanceAlertField;
  justification: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertCounterbalanceCylinderAirbagResponseDto>) {
    Object.assign(this, partial);
  }
}
