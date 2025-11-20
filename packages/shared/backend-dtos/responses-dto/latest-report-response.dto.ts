import { ServiceType, ServiceSection } from '@titans-tech/db/enums';
import type { BearingClearanceData } from '@titans-tech/db';
import { AlertBearingClearanceResponseDto } from './alert-bearing-clearance-response.dto';

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
    SLIDE: null; // Future implementation
    GIBS: null; // Future implementation
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: null; // Future implementation
    CLUTCH: null; // Future implementation
    COUNTERBALANCE_CYLINDER_AIRBAG: null; // Future implementation
  };

  constructor(partial: Partial<LatestReportResponseDto>) {
    Object.assign(this, partial);
  }
}
