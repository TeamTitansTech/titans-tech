import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertClutchResponseDto {
  id: string;
  machineServiceId: string;

  // Gear Backlash alert
  gearBacklash_before: number;
  gearBacklash_after: number;
  gearBacklash_differential: number;
  gearBacklash_severity: AlertSeverity;

  // Crank Endplay alert
  crankEndplay_before: number;
  crankEndplay_after: number;
  crankEndplay_differential: number;
  crankEndplay_severity: AlertSeverity;

  // Brake Clearance alert
  brakeClearance_total: number;
  brakeClearance_rear: number;
  brakeClearance_differential: number;
  brakeClearance_severity: AlertSeverity;

  // Hydraulic Clutch Clearance alert
  hydClutchClearance_total: number;
  hydClutchClearance_rear: number;
  hydClutchClearance_differential: number;
  hydClutchClearance_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertClutchResponseDto> & { clutchData?: any }) {
    // Extract clutchData if present
    const { clutchData, ...alertData } = partial as any;

    // Assign alert data (differential, severity, timestamps, etc)
    Object.assign(this, alertData);

    // If clutchData is provided, extract Before/After and Total/Rear values from it
    if (clutchData) {
      // Gear Backlash (Before/After)
      this.gearBacklash_before =
        clutchData.gearBacklashBefore?.toNumber?.() ?? clutchData.gearBacklashBefore;
      this.gearBacklash_after =
        clutchData.gearBacklashAfter?.toNumber?.() ?? clutchData.gearBacklashAfter;

      // Crank Endplay (Before/After)
      this.crankEndplay_before =
        clutchData.crankEndplayBefore?.toNumber?.() ?? clutchData.crankEndplayBefore;
      this.crankEndplay_after =
        clutchData.crankEndplayAfter?.toNumber?.() ?? clutchData.crankEndplayAfter;

      // Brake Clearance (Total/Rear)
      this.brakeClearance_total =
        clutchData.brakeClearanceTotal?.toNumber?.() ?? clutchData.brakeClearanceTotal;
      this.brakeClearance_rear =
        clutchData.brakeClearanceRear?.toNumber?.() ?? clutchData.brakeClearanceRear;

      // Hydraulic Clutch Clearance (Total/Rear)
      this.hydClutchClearance_total =
        clutchData.hydClutchClearanceTotal?.toNumber?.() ?? clutchData.hydClutchClearanceTotal;
      this.hydClutchClearance_rear =
        clutchData.hydClutchClearanceRear?.toNumber?.() ?? clutchData.hydClutchClearanceRear;
    }

    // Convert Decimal to number for differential fields
    const decimalFields = [
      'gearBacklash_differential',
      'crankEndplay_differential',
      'brakeClearance_differential',
      'hydClutchClearance_differential',
    ];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
