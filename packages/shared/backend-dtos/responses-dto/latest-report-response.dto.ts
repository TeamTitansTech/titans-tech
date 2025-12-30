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
  ShimThicknessData,
} from '@titans-tech/db';
import { AlertBearingClearanceResponseDto } from './alert-bearing-clearance-response.dto';
import { AlertBearingClearanceSingleHammerResponseDto } from './alert-bearing-clearance-single-hammer-response.dto';
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
 * DTO for the latest Slide Single Hammer data in a machine
 */
export class LatestSlideSingleHammerDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: {
    beforeData?: SlideData;
    data?: SlideData;
  }; // Slide data with before and after measurements
  alert?: AlertSlideResponseDto; // Alert if exists

  constructor(partial: Partial<LatestSlideSingleHammerDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Slide Double Hammer data in a machine
 */
export class LatestSlideDoubleHammerDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType; // INSPECTION | MAINTENANCE
  data: {
    outerBefore?: SlideData;
    outerData?: SlideData;
    innerBefore?: SlideData;
    innerData?: SlideData;
  }; // Slide data with outer and inner measurements (before and after)
  alert?: AlertSlideResponseDto; // Alert if exists

  constructor(partial: Partial<LatestSlideDoubleHammerDto>) {
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
 * DTO for the latest Bearing Clearance Single Hammer data in a machine
 */
export class LatestBearingClearanceSingleHammerDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType;
  data: {
    beforeData?: BearingClearanceData;
    data?: BearingClearanceData;
  };
  alert?: AlertBearingClearanceSingleHammerResponseDto; // Alert if exists

  constructor(partial: Partial<LatestBearingClearanceSingleHammerDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Shim Thickness data in a machine
 */
export class LatestShimThicknessDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType;
  data: {
    outerLhData?: ShimThicknessData;
    outerRhData?: ShimThicknessData;
    innerLhData?: ShimThicknessData;
    innerRhData?: ShimThicknessData;
    notes?: string;
  };

  constructor(partial: Partial<LatestShimThicknessDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Die Cushion data in a machine
 */
export class LatestDieCushionDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType;
  data: {
    airLeaks?: string;
    airLeaksLocation?: string;
    pneumaticsPlumbing?: string;
    lubrication?: string;
    notes?: string;
  };

  constructor(partial: Partial<LatestDieCushionDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Electrical Control data in a machine
 */
export class LatestElectricalControlDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType;
  data: {
    hasHourMeter?: string;
    hourMeterReading?: string;
    isMinsterControl?: string;
    minsterControlOther?: string;
    controlDoorStop?: string;
    cabinetTemp?: string;
    incomingLine?: string;
    fullVoltage?: string;
    contactor?: string;
    overloads?: string;
    transformers?: string;
    brakeValve?: string;
    clutchValve?: string;
    wiring?: string;
    terminals?: string;
    twentyFourVBuss?: string;
    safetyRelays?: string;
    notes?: string;
  };

  constructor(partial: Partial<LatestElectricalControlDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Perpendicularity data in a machine
 */
export class LatestPerpendicularityDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType;
  data: {
    hasBeenAdjusted?: string;
    beforeFR?: number;
    beforeLR?: number;
    afterFR?: number;
    afterLR?: number;
    notes?: string;
  };

  constructor(partial: Partial<LatestPerpendicularityDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for the latest Angularity data in a machine
 */
export class LatestAngularityDto {
  latestServiceId: string;
  latestServiceDate: Date;
  serviceType: ServiceType;
  data: {
    hasBeenAdjusted?: string;
    spm?: number;
    distanceOfIndicatorTip?: number;
    locationOfIndicator?: string;
    counterbalancePressure?: number;
    strokePartBeingRead?: string;
    shutheightSetAt?: string;
    whatWasUsedAsSquare?: string;
    whereWasSquarePlaced?: string;
    indicatorUsedGraduation?: string;
    tipKindOnIndicator?: string;
    totalLiftCheck?: number;
    beforeFR?: number;
    beforeLR?: number;
    afterFR?: number;
    afterLR?: number;
    notes?: string;
  };

  constructor(partial: Partial<LatestAngularityDto>) {
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
    BEARING_CLEARANCE_SINGLE_HAMMER: LatestBearingClearanceSingleHammerDto | null;
    SLIDE_SINGLE_HAMMER: LatestSlideSingleHammerDto | null;
    SLIDE_DOUBLE_HAMMER: LatestSlideDoubleHammerDto | null;
    GIBS: LatestGibsDto | null;
    PISTONS: LatestPistonsDto | null;
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: LatestLubricationDto | null;
    CLUTCH: LatestClutchDto | null;
    CLUTCH_CEVOLANI: LatestClutchDto | null;
    COUNTERBALANCE_CYLINDER_AIRBAG: LatestCounterbalanceDto | null;
    TRAMMING: LatestTrammingDto | null;
    SHIM_THICKNESS: LatestShimThicknessDto | null;
    DIE_CUSHION: LatestDieCushionDto | null;
    ELECTRICAL_CONTROL: LatestElectricalControlDto | null;
    PERPENDICULARITY: LatestPerpendicularityDto | null;
    ANGULARITY: LatestAngularityDto | null;
  };

  constructor(partial: Partial<LatestReportResponseDto>) {
    Object.assign(this, partial);
  }
}
