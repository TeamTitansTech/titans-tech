/**
 * Data Transformation Utilities
 * Convert service data to chart-ready format
 */

import { format } from 'date-fns';
import type { MeasurementDataPoint, MultiLineMeasurementData, ThresholdConfig } from './types';
import type { BearingClearanceData, ClutchData } from '@titans-tech/shared/types/services';

/** Inspection record containing bearing clearance check data (Prisma relation array) */
interface BearingClearanceInspection {
  date: string;
  bearingClearance: Array<{
    outerData?: BearingClearanceData | null;
  }>;
}

/**
 * Prisma returns `null` for empty optional fields, while Zod's `.optional()` yields `undefined`.
 * This utility type bridges that gap so callers with Prisma-shaped data are compatible.
 */
type Nullable<T> = { [K in keyof T]: T[K] | null };

/** Inspection record containing clutch check data (Prisma relation array) */
interface ClutchInspection {
  date: string;
  clutch: Array<{
    data: Nullable<ClutchData> | null;
  }>;
}

/** Slide position measurements as accessed by transformers (position1..5) */
interface SlidePositionData {
  position1: number | null;
  position2: number | null;
  position3: number | null;
  position4: number | null;
  position5: number | null;
}

/** Inspection record containing slide double hammer check data (Prisma relation array) */
interface SlideDoubleHammerInspection {
  date: string;
  slideDoubleHammer: Array<{
    outerData?: SlidePositionData | null;
    innerData?: SlidePositionData | null;
  }>;
}

/** Inspection record containing slide single hammer check data (Prisma relation array) */
interface SlideSingleHammerInspection {
  date: string;
  slideSingleHammer: Array<{
    data?: SlidePositionData | null;
  }>;
}

/** Gibs stage point measurements as accessed by transformers (point1..16) */
interface GibsPointData {
  point1?: number | null;
  point2?: number | null;
  point3?: number | null;
  point4?: number | null;
  point5?: number | null;
  point6?: number | null;
  point7?: number | null;
  point8?: number | null;
  point9?: number | null;
  point10?: number | null;
  point11?: number | null;
  point12?: number | null;
  point13?: number | null;
  point14?: number | null;
  point15?: number | null;
  point16?: number | null;
}

/** Inspection record containing gibs check data (Prisma relation array) */
interface GibsInspection {
  date: string;
  gibs: Array<{
    outerData?: GibsPointData | null;
    innerData?: GibsPointData | null;
  }>;
}

/**
 * Transform bearing clearance inspection data to single-line chart format
 */
export function transformBearingClearanceToChartData(
  inspections: BearingClearanceInspection[],
  measurementField: keyof BearingClearanceData,
): MeasurementDataPoint[] {
  return inspections
    .filter((inspection) => inspection.bearingClearance?.[0]?.outerData)
    .map((inspection) => ({
      date: format(new Date(inspection.date), 'dd/MM/yyyy'),
      value: Number(inspection.bearingClearance[0].outerData![measurementField]),
      label: format(new Date(inspection.date), 'dd/MM/yyyy'),
    }))
    .reverse(); // Oldest to newest
}

/**
 * Transform bearing clearance inspection data to multi-line chart format (RH vs LH)
 */
export function transformBearingClearanceToMultiLineData(
  inspections: BearingClearanceInspection[],
  baseFieldName: string, // e.g., 'totalClearance', 'mainBearings'
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => inspection.bearingClearance?.[0]?.outerData)
    .map((inspection) => {
      const after = inspection.bearingClearance[0].outerData!;
      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        [`${baseFieldName}_RH`]: Number(after[`${baseFieldName}_RH` as keyof BearingClearanceData]),
        [`${baseFieldName}_LH`]: Number(after[`${baseFieldName}_LH` as keyof BearingClearanceData]),
      };
    })
    .reverse(); // Oldest to newest
}

/**
 * Transform bearing clearance inspection data to differential chart format
 * Shows |RH - LH| over time for each measurement type
 */
export function transformBearingClearanceToDifferentialData(
  inspections: BearingClearanceInspection[],
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => inspection.bearingClearance?.[0]?.outerData)
    .map((inspection) => {
      const data = inspection.bearingClearance[0].outerData!;
      const tcRH = Number(data.totalClearance_RH) || 0;
      const tcLH = Number(data.totalClearance_LH) || 0;
      const ucbRH = Number(data.upperConnectionBearings_RH) || 0;
      const ucbLH = Number(data.upperConnectionBearings_LH) || 0;
      const mbRH = Number(data.mainBearings_RH) || 0;
      const mbLH = Number(data.mainBearings_LH) || 0;

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        totalClearance_diff: Math.abs(tcRH - tcLH),
        upperConnectionBearings_diff: Math.abs(ucbRH - ucbLH),
        mainBearings_diff: Math.abs(mbRH - mbLH),
      };
    })
    .reverse(); // Oldest to newest
}

/**
 * Transform clutch inspection data to single-line chart format
 */
export function transformClutchToChartData(
  inspections: ClutchInspection[],
  measurementField: keyof ClutchData,
): MeasurementDataPoint[] {
  return inspections
    .filter((inspection) => inspection.clutch?.[0]?.data)
    .map((inspection) => ({
      date: format(new Date(inspection.date), 'dd/MM/yyyy'),
      value: Number(inspection.clutch[0].data![measurementField]),
      label: format(new Date(inspection.date), 'dd/MM/yyyy'),
    }))
    .reverse();
}

/**
 * Transform clutch inspection data to multi-line chart format
 * @param inspections - Array of inspection data
 * @param measurementFields - Array of field names to include in the chart
 */
export function transformClutchToMultiLineData(
  inspections: ClutchInspection[],
  measurementFields: (keyof ClutchData)[],
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => inspection.clutch?.[0]?.data)
    .map((inspection) => {
      const clutchData = inspection.clutch[0].data!;
      const result: MultiLineMeasurementData = {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
      };

      measurementFields.forEach((field) => {
        const value = clutchData[field];
        result[field as string] = value !== null && value !== undefined ? Number(value) : 0;
      });

      return result;
    })
    .reverse();
}

/**
 * Transform slide inspection data to chart format
 * Calculates max deviation from position measurements
 */
export function transformSlideToChartData(
  inspections: SlideDoubleHammerInspection[],
  type: 'outer' | 'inner' = 'outer',
): MeasurementDataPoint[] {
  return inspections
    .filter((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideDoubleHammer?.[0]?.outerData
          : inspection.slideDoubleHammer?.[0]?.innerData;
      return slideData;
    })
    .map((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideDoubleHammer[0].outerData!
          : inspection.slideDoubleHammer[0].innerData!;

      // Calculate max deviation from 5 positions
      const positions = [
        Number(slideData.position1),
        Number(slideData.position2),
        Number(slideData.position3),
        Number(slideData.position4),
        Number(slideData.position5),
      ].filter((p) => !isNaN(p));

      const maxDeviation =
        positions.length > 0 ? Math.max(...positions) - Math.min(...positions) : 0;

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        value: maxDeviation,
        label: format(new Date(inspection.date), 'dd/MM/yyyy'),
      };
    })
    .reverse();
}

/**
 * Transform slide position data to multi-line chart format
 */
export function transformSlidePositionsToMultiLineData(
  inspections: SlideDoubleHammerInspection[],
  type: 'outer' | 'inner' = 'outer',
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideDoubleHammer?.[0]?.outerData
          : inspection.slideDoubleHammer?.[0]?.innerData;
      return slideData;
    })
    .map((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideDoubleHammer[0].outerData!
          : inspection.slideDoubleHammer[0].innerData!;

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        position1: Number(slideData.position1),
        position2: Number(slideData.position2),
        position3: Number(slideData.position3),
        position4: Number(slideData.position4),
        position5: Number(slideData.position5),
      };
    })
    .reverse();
}

/**
 * Transform slide inspection data to max deviation chart format (double hammer)
 * Calculates max deviation (max - min) from all 5 position measurements
 */
export function transformSlideMaxDeviationToMultiLineData(
  inspections: SlideDoubleHammerInspection[],
): MultiLineMeasurementData[] {
  return inspections
    .filter(
      (inspection) =>
        inspection.slideDoubleHammer?.[0]?.outerData ||
        inspection.slideDoubleHammer?.[0]?.innerData,
    )
    .map((inspection) => {
      const outerData = inspection.slideDoubleHammer?.[0]?.outerData;
      const innerData = inspection.slideDoubleHammer?.[0]?.innerData;

      // Calculate max deviation for outer
      let outerMaxDeviation = 0;
      if (outerData) {
        const outerPositions = [
          Number(outerData.position1),
          Number(outerData.position2),
          Number(outerData.position3),
          Number(outerData.position4),
          Number(outerData.position5),
        ].filter((p) => !isNaN(p));

        if (outerPositions.length > 0) {
          outerMaxDeviation = Math.max(...outerPositions) - Math.min(...outerPositions);
        }
      }

      // Calculate max deviation for inner
      let innerMaxDeviation = 0;
      if (innerData) {
        const innerPositions = [
          Number(innerData.position1),
          Number(innerData.position2),
          Number(innerData.position3),
          Number(innerData.position4),
          Number(innerData.position5),
        ].filter((p) => !isNaN(p));

        if (innerPositions.length > 0) {
          innerMaxDeviation = Math.max(...innerPositions) - Math.min(...innerPositions);
        }
      }

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        outerMaxDeviation,
        innerMaxDeviation,
      };
    })
    .reverse();
}

/**
 * Transform slide single hammer position data to multi-line chart format
 * Note: slideSingleHammer is an array from Prisma, access [0]
 */
export function transformSlideSingleHammerPositionsToMultiLineData(
  inspections: SlideSingleHammerInspection[],
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => inspection.slideSingleHammer?.[0]?.data)
    .map((inspection) => {
      const slideData = inspection.slideSingleHammer[0].data!;

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        position1: slideData.position1 != null ? Number(slideData.position1) : NaN,
        position2: slideData.position2 != null ? Number(slideData.position2) : NaN,
        position3: slideData.position3 != null ? Number(slideData.position3) : NaN,
        position4: slideData.position4 != null ? Number(slideData.position4) : NaN,
        position5: slideData.position5 != null ? Number(slideData.position5) : NaN,
      };
    })
    .reverse();
}

/**
 * Transform slide single hammer inspection data to max deviation chart format
 * Calculates max deviation (max - min) from all 5 position measurements
 * Note: slideSingleHammer is an array from Prisma, access [0]
 */
export function transformSlideSingleHammerMaxDeviationToMultiLineData(
  inspections: SlideSingleHammerInspection[],
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => inspection.slideSingleHammer?.[0]?.data)
    .map((inspection) => {
      const slideData = inspection.slideSingleHammer[0].data!;

      // Calculate max deviation
      let outerMaxDeviation = 0;
      const positions = [
        slideData.position1,
        slideData.position2,
        slideData.position3,
        slideData.position4,
        slideData.position5,
      ]
        .filter((p) => p != null)
        .map((p) => Number(p))
        .filter((p) => !isNaN(p));

      if (positions.length > 0) {
        outerMaxDeviation = Math.max(...positions) - Math.min(...positions);
      }

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        outerMaxDeviation,
      };
    })
    .reverse();
}

/**
 * Calculate usable value from gibs stage data
 * Usable = min(left side points) + min(right side points)
 */
function calculateGibsUsable(stageData: GibsPointData | null | undefined): number | null {
  if (!stageData) return null;

  // Convert to number, handling optional/nullable fields
  const toNum = (val: number | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    return isNaN(val) ? 0 : val;
  };
  // Check if value is a valid number
  const isNum = (val: number | null | undefined): boolean => {
    if (val === null || val === undefined) return false;
    return !isNaN(val);
  };

  const topPointsCount = [
    stageData.point9,
    stageData.point10,
    stageData.point13,
    stageData.point14,
  ].filter(isNum).length;

  const bottomPointsCount = [
    stageData.point11,
    stageData.point12,
    stageData.point15,
    stageData.point16,
  ].filter(isNum).length;

  if (topPointsCount === 4 && bottomPointsCount === 4) {
    const minLeft = Math.min(
      toNum(stageData.point9),
      toNum(stageData.point11),
      toNum(stageData.point13),
      toNum(stageData.point15),
    );
    const minRight = Math.min(
      toNum(stageData.point10),
      toNum(stageData.point12),
      toNum(stageData.point14),
      toNum(stageData.point16),
    );
    return minLeft + minRight;
  } else if (topPointsCount === 4) {
    const minTopLeft = Math.min(toNum(stageData.point9), toNum(stageData.point13));
    const minTopRight = Math.min(toNum(stageData.point10), toNum(stageData.point14));
    return minTopLeft + minTopRight;
  } else if (bottomPointsCount === 4) {
    const minBottomLeft = Math.min(toNum(stageData.point11), toNum(stageData.point15));
    const minBottomRight = Math.min(toNum(stageData.point12), toNum(stageData.point16));
    return minBottomLeft + minBottomRight;
  }

  return null;
}

/**
 * Transform gibs inspection data to chart format for usable value
 */
export function transformGibsUsableToChartData(
  inspections: GibsInspection[],
  stageType: 'outerData' | 'innerData' = 'innerData',
): MeasurementDataPoint[] {
  return inspections
    .filter((inspection) => inspection.gibs?.[0]?.[stageType])
    .map((inspection) => {
      const stageData = inspection.gibs[0][stageType]!;
      const usable = calculateGibsUsable(stageData);

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        value: usable ?? 0,
        label: format(new Date(inspection.date), 'dd/MM/yyyy'),
      };
    })
    .reverse();
}

/**
 * Transform gibs inspection data to multi-line chart format
 * Shows calculated directional sums over time
 */
export function transformGibsToMultiLineData(
  inspections: GibsInspection[],
  stageType: 'outerData' | 'innerData' = 'innerData',
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => inspection.gibs?.[0]?.[stageType])
    .map((inspection) => {
      const stageData = inspection.gibs[0][stageType]!;
      const toNum = (val: number | null | undefined): number => (typeof val === 'number' ? val : 0);

      // Calculate directional sums
      const leftTop = toNum(stageData.point9) + toNum(stageData.point13);
      const leftBottom = toNum(stageData.point11) + toNum(stageData.point15);
      const rightTop = toNum(stageData.point10) + toNum(stageData.point14);
      const rightBottom = toNum(stageData.point12) + toNum(stageData.point16);
      const usable = calculateGibsUsable(stageData);

      return {
        date: format(new Date(inspection.date), 'dd/MM/yyyy'),
        leftTop,
        leftBottom,
        rightTop,
        rightBottom,
        usable: usable ?? 0,
      };
    })
    .reverse();
}

/**
 * Extract threshold configuration from API response
 */
export function extractThresholdConfig(
  thresholdResponse: Record<string, number | string | null | undefined>,
  fieldPrefix: string,
): ThresholdConfig {
  return {
    greenMin: Number(thresholdResponse[`${fieldPrefix}_greenMin`]),
    yellowMin: Number(thresholdResponse[`${fieldPrefix}_yellowMin`]),
    redMin: Number(thresholdResponse[`${fieldPrefix}_redMin`]),
    label: fieldPrefix,
  };
}

/**
 * Create real-time chart data combining historical + current entry
 */
export function createRealTimeChartData(
  currentValue: number | null | undefined,
  historicalData: MeasurementDataPoint[],
): MeasurementDataPoint[] {
  if (currentValue === null || currentValue === undefined) {
    return historicalData;
  }

  return [
    ...historicalData,
    {
      date: 'Current',
      value: currentValue,
      label: 'Current Entry',
    },
  ];
}
