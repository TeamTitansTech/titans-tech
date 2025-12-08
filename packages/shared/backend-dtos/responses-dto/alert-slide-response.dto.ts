import { AlertSeverity } from '@titans-tech/db/enums';

// DEPRECATED: Use AlertSlideSingleHammerResponseDto and AlertSlideDoubleHammerResponseDto
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

// Alert response for Single Hammer Slide
export class AlertSlideSingleHammerResponseDto {
  id: string;
  machineServiceId: string;

  // Max Deviation alert (single hammer only has one set of measurements)
  maxDeviation_positions: number[]; // 5 positions
  maxDeviation_differential: number;
  maxDeviation_severity: AlertSeverity;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AlertSlideSingleHammerResponseDto> & { slideData?: any }) {
    // Extract slideData if present
    const { slideData, ...alertData } = partial as any;

    // Assign alert data (differential, severity, timestamps, etc)
    Object.assign(this, alertData);

    // If slideData is provided, extract position values from it
    if (slideData) {
      this.maxDeviation_positions = [
        slideData.position1?.toNumber?.() ?? slideData.position1,
        slideData.position2?.toNumber?.() ?? slideData.position2,
        slideData.position3?.toNumber?.() ?? slideData.position3,
        slideData.position4?.toNumber?.() ?? slideData.position4,
        slideData.position5?.toNumber?.() ?? slideData.position5,
      ].filter((v) => v !== null && v !== undefined);
    }

    // Convert Decimal to number for differential field
    if (
      this.maxDeviation_differential &&
      typeof (this.maxDeviation_differential as any).toNumber === 'function'
    ) {
      this.maxDeviation_differential = (this.maxDeviation_differential as any).toNumber();
    }
  }
}

// Alert response for Double Hammer Slide
export class AlertSlideDoubleHammerResponseDto {
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

  constructor(
    partial: Partial<AlertSlideDoubleHammerResponseDto> & {
      slideData?: { outer?: any; inner?: any };
    },
  ) {
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
