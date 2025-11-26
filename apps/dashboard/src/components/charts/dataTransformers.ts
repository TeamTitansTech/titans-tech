/**
 * Data Transformation Utilities
 * Convert service data to chart-ready format
 */

import { format } from 'date-fns';
import type { MeasurementDataPoint, MultiLineMeasurementData, ThresholdConfig } from './types';
import type {
  BearingClearanceData,
  ClutchData,
  SlideData,
} from '@titans-tech/shared/types/services';

/**
 * Transform bearing clearance inspection data to single-line chart format
 */
export function transformBearingClearanceToChartData(
  inspections: any[], // InspectionData type
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
  inspections: any[],
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
 * Transform clutch inspection data to chart format
 */
export function transformClutchToChartData(
  inspections: any[],
  measurementField: keyof ClutchData,
): MeasurementDataPoint[] {
  return inspections
    .filter((inspection) => inspection.clutchChecks?.[0]?.data)
    .map((inspection) => ({
      date: format(new Date(inspection.date), 'dd/MM/yyyy'),
      value: Number(inspection.clutchChecks[0].data![measurementField]),
      label: format(new Date(inspection.date), 'dd/MM/yyyy'),
    }))
    .reverse();
}

/**
 * Transform slide inspection data to chart format
 * Calculates max deviation from position measurements
 */
export function transformSlideToChartData(
  inspections: any[],
  type: 'outer' | 'inner' = 'outer',
): MeasurementDataPoint[] {
  return inspections
    .filter((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideChecks?.[0]?.outerData
          : inspection.slideChecks?.[0]?.innerData;
      return slideData;
    })
    .map((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideChecks[0].outerData!
          : inspection.slideChecks[0].innerData!;

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
  inspections: any[],
  type: 'outer' | 'inner' = 'outer',
): MultiLineMeasurementData[] {
  return inspections
    .filter((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideChecks?.[0]?.outerData
          : inspection.slideChecks?.[0]?.innerData;
      return slideData;
    })
    .map((inspection) => {
      const slideData =
        type === 'outer'
          ? inspection.slideChecks[0].outerData!
          : inspection.slideChecks[0].innerData!;

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
 * Extract threshold configuration from API response
 */
export function extractThresholdConfig(
  thresholdResponse: any,
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
