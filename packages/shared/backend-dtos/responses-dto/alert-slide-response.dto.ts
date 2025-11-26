import { AlertSeverity } from '@titans-tech/db/enums';

export class AlertSlideResponseDto {
  id: string;
  machineServiceId: string;

  // Outer Max Deviation alert
  maxDeviationOuter_positions: number[]; // 5 positions
  maxDeviationOuter_differential: number;
  maxDeviationOuter_severity: AlertSeverity;

  // Inner Max Deviation alert
  maxDeviationInner_positions: number[]; // 5 positions
  maxDeviationInner_differential: number;
  maxDeviationInner_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertSlideResponseDto> & { slideData?: any }) {
    // Extract slideData if present
    const { slideData, ...alertData } = partial as any;

    // Assign alert data (differential, severity, timestamps, etc)
    Object.assign(this, alertData);

    // If slideData is provided, extract position values from it
    if (slideData) {
      // Outer positions
      if (slideData.outer) {
        this.maxDeviationOuter_positions = [
          slideData.outer.position1?.toNumber?.() ?? slideData.outer.position1,
          slideData.outer.position2?.toNumber?.() ?? slideData.outer.position2,
          slideData.outer.position3?.toNumber?.() ?? slideData.outer.position3,
          slideData.outer.position4?.toNumber?.() ?? slideData.outer.position4,
          slideData.outer.position5?.toNumber?.() ?? slideData.outer.position5,
        ].filter((v) => v !== null && v !== undefined);
      }

      // Inner positions
      if (slideData.inner) {
        this.maxDeviationInner_positions = [
          slideData.inner.position1?.toNumber?.() ?? slideData.inner.position1,
          slideData.inner.position2?.toNumber?.() ?? slideData.inner.position2,
          slideData.inner.position3?.toNumber?.() ?? slideData.inner.position3,
          slideData.inner.position4?.toNumber?.() ?? slideData.inner.position4,
          slideData.inner.position5?.toNumber?.() ?? slideData.inner.position5,
        ].filter((v) => v !== null && v !== undefined);
      }
    }

    // Convert Decimal to number for differential fields
    const decimalFields = ['maxDeviationOuter_differential', 'maxDeviationInner_differential'];

    decimalFields.forEach((field) => {
      const value = (this as any)[field];
      if (value && typeof value.toNumber === 'function') {
        (this as any)[field] = value.toNumber();
      }
    });
  }
}
