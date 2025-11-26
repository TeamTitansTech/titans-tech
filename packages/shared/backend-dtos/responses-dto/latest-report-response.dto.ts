import { ServiceType, ServiceSection } from '@titans-tech/db/enums';
import { BearingClearanceData, ClutchData, SlideData, GibsStageData } from '@titans-tech/db';
import { AlertBearingClearanceResponseDto } from './alert-bearing-clearance-response.dto';
import { AlertClutchResponseDto } from './alert-clutch-response.dto';
import { AlertSlideResponseDto } from './alert-slide-response.dto';
import { AlertGibsResponseDto } from './alert-gibs-response.dto';

/**
 * DTO for the latest BearingClearance data in a machine
 */
export class LatestBearingClearanceDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: BearingClearanceData; // Data from outerData || innerData
  alert?: AlertBearingClearanceResponseDto; // Alert if exists

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
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: null; // Future implementation
    CLUTCH: LatestClutchDto | null;
    COUNTERBALANCE_CYLINDER_AIRBAG: null; // Future implementation
  };

  constructor(partial: Partial<LatestReportResponseDto>) {
    Object.assign(this, partial);
  }
}
