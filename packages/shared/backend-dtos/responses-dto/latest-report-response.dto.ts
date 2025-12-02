import { ServiceType, ServiceSection } from '@titans-tech/db/enums';
import {
  BearingClearanceData,
  ClutchData,
  SlideData,
  GibsStageData,
  LubricationHydraulicsData,
  LubricationHydraulicsGauge,
  CounterbalanceCylinderAirbagData,
  PistonsData,
  TrammingData,
} from '@titans-tech/db';
import { AlertBearingClearanceResponseDto } from './alert-bearing-clearance-response.dto';
import { AlertClutchResponseDto } from './alert-clutch-response.dto';
import { AlertSlideResponseDto } from './alert-slide-response.dto';
import { AlertGibsResponseDto } from './alert-gibs-response.dto';
import { AlertCounterbalanceCylinderAirbagResponseDto } from './alert-counterbalance-response.dto';
import { AlertPistonsResponseDto } from './alert-pistons-response.dto';
import { AlertTrammingResponseDto } from './alert-tramming-response.dto';

/**
 * DTO for the latest BearingClearance data in a machine
 */
export class LatestBearingClearanceDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  outerData?: BearingClearanceData; // Outer bearing clearance data
  innerData?: BearingClearanceData; // Inner bearing clearance data
  alert?: AlertBearingClearanceResponseDto; // Alert if exists (with outer_/inner_ prefixed fields)

  constructor(partial: Partial<LatestBearingClearanceDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Clutch data in a machine
 */
export class LatestClutchDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: ClutchData; // Clutch data
  alert?: AlertClutchResponseDto; // Alert if exists

  constructor(partial: Partial<LatestClutchDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Slide data in a machine
 */
export class LatestSlideDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: {
    outerData?: SlideData;
    innerData?: SlideData;
  }; // Slide data with outer and inner measurements
  alert?: AlertSlideResponseDto; // Alert if exists

  constructor(partial: Partial<LatestSlideDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest GIBS data in a machine
 */
export class LatestGibsDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: GibsStageData; // Outer After Adjustment data (used for alerts)
  alert?: AlertGibsResponseDto; // Alert if exists

  constructor(partial: Partial<LatestGibsDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for Lubrication data with gauges
 */
export interface LubricationDataWithGauges extends LubricationHydraulicsData {
  gauges: LubricationHydraulicsGauge[];
}

/**
 * Alert severity for oil change status
 */
export type OilChangeAlertSeverity = 'NONE' | 'GREEN' | 'YELLOW' | 'RED';

/**
 * Alert data for oil change status
 */
export interface OilChangeAlert {
  lastOilChangeDate: Date | null;
  daysSinceChange: number | null;
  daysUntilDue: number | null;
  severity: OilChangeAlertSeverity;
}

/**
 * DTO for the latest Lubrication & Hydraulics data in a machine
 */
export class LatestLubricationDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: LubricationDataWithGauges; // Lubrication data with gauges
  alert?: OilChangeAlert; // Oil change status alert

  constructor(partial: Partial<LatestLubricationDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Pistons data in a machine
 */
export class LatestPistonsDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: {
    guideSeals?: string;
    pistonSeals?: string;
    vacuumSystem?: string;
    vacuumSystemAirPressureSetting?: number;
    outerData?: PistonsData;
    innerData?: PistonsData;
    notes?: string;
  };
  alert?: AlertPistonsResponseDto; // Alert if exists (with outer_/inner_ prefixed fields)

  constructor(partial: Partial<LatestPistonsDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Counterbalance Cylinder/Airbag data in a machine
 */
export class LatestCounterbalanceDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: {
    outerData?: CounterbalanceCylinderAirbagData;
    innerData?: CounterbalanceCylinderAirbagData;
    notes?: string;
  };
  alerts?: AlertCounterbalanceCylinderAirbagResponseDto[]; // Manual alerts for counterbalance

  constructor(partial: Partial<LatestCounterbalanceDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Tramming data in a machine
 */
export class LatestTrammingDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: {
    outerData?: TrammingData;
    innerData?: TrammingData;
  }; // Tramming data with outer and inner measurements
  alert?: AlertTrammingResponseDto; // Alert if exists (with outer_/inner_ prefixed fields)

  constructor(partial: Partial<LatestTrammingDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the complete latest report of a machine
 * Shows the most recent data for each section based on the blueprint
 */
export class LatestReportResponseDto {
  machineId: string;
  machineName: string;
  blueprint: {
    id: string;
    name: string;
    sections: ServiceSection[];
  };
  generatedAt: Date;
  sections: {
    BEARING_CLEARANCE: LatestBearingClearanceDto | null;
    SLIDE: LatestSlideDto | null;
    GIBS: LatestGibsDto | null;
    PISTONS: LatestPistonsDto | null;
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: LatestLubricationDto | null;
    CLUTCH: LatestClutchDto | null;
    COUNTERBALANCE_CYLINDER_AIRBAG: LatestCounterbalanceDto | null;
    TRAMMING: LatestTrammingDto | null;
  };

  constructor(partial: Partial<LatestReportResponseDto>) {
    Object.assign(this, partial);
  }
}
