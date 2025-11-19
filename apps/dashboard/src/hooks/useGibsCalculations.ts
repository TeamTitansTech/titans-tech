import { useMemo } from 'react';

// Types for GIBS stage data
export interface GibsStageData {
  // Front to Back positions (1-8)
  position1?: number;
  position2?: number;
  position3?: number;
  position4?: number;
  position5?: number;
  position6?: number;
  position7?: number;
  position8?: number;

  // Left to Right positions (9-16)
  position9?: number;
  position10?: number;
  position11?: number;
  position12?: number;
  position13?: number;
  position14?: number;
  position15?: number;
  position16?: number;

  // Special inputs for Outer After Installation
  topFront?: number;
  topBack?: number;

  // Calculated outputs from Front to Back positions (1-8) -> Left/Right
  calculatedLeftTop?: number;
  calculatedLeftBottom?: number;
  calculatedRightTop?: number;
  calculatedRightBottom?: number;

  // Calculated outputs from Left to Right positions (9-16) -> Front/Back
  calculatedFrontTop?: number;
  calculatedFrontBottom?: number;
  calculatedBackTop?: number;
  calculatedBackBottom?: number;

  // Calculated outputs - Special cases
  calculatedTopFront?: number;
  calculatedTopBack?: number;
  calculatedTopRear?: number;
  calculatedBottomFront?: number;
  calculatedBottomBack?: number;
  calculatedLeft?: number;
  calculatedRight?: number;
  calculatedUsable?: number;

  // Differentials
  differentialTopFront?: number;
  differentialTopBack?: number;
  differentialTopRear?: number;
  differentialBottom?: number;
  differentialLeft?: number;
  differentialRight?: number;
}

// Helper function to calculate average of an array of numbers
const calculateAverage = (values: (number | undefined)[]): number | undefined => {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null);
  if (validValues.length === 0) return undefined;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
};

// Helper function to calculate differential
const calculateDifferential = (after?: number, before?: number): number | undefined => {
  if (after === undefined || before === undefined) return undefined;
  return after - before;
};

/**
 * OUTER SLIDE GIBS - Before Tool Installation Tab
 */

// Stage 1: Before Adjustment
// Inputs: positions 1-16
// Outputs from Front to Back (1-8): Left Top, Left Bottom, Right Top, Right Bottom
// Outputs from Left to Right (9-16): Front Top, Front Bottom, Back Top, Back Bottom, Usable
export const calculateOuterBeforeAdjustment = (data: GibsStageData): GibsStageData => {
  // From Front to Back positions (1-8) -> Calculate Left/Right
  const calculatedLeftTop = calculateAverage([data.position1, data.position2]);
  const calculatedLeftBottom = calculateAverage([data.position3, data.position4]);
  const calculatedRightTop = calculateAverage([data.position5, data.position6]);
  const calculatedRightBottom = calculateAverage([data.position7, data.position8]);

  // From Left to Right positions (9-16) -> Calculate Front/Back
  const calculatedFrontTop = calculateAverage([data.position9, data.position10]);
  const calculatedFrontBottom = calculateAverage([data.position11, data.position12]);
  const calculatedBackTop = calculateAverage([data.position13, data.position14]);
  const calculatedBackBottom = calculateAverage([data.position15, data.position16]);

  // Usable = average of all Front/Back values
  const calculatedUsable = calculateAverage([
    calculatedFrontTop,
    calculatedFrontBottom,
    calculatedBackTop,
    calculatedBackBottom
  ]);

  return {
    ...data,
    calculatedLeftTop,
    calculatedLeftBottom,
    calculatedRightTop,
    calculatedRightBottom,
    calculatedFrontTop,
    calculatedFrontBottom,
    calculatedBackTop,
    calculatedBackBottom,
    calculatedUsable,
  };
};

// Stage 2: After Adjustment
// Same calculation as Stage 1, plus differentials
export const calculateOuterAfterAdjustment = (
  data: GibsStageData,
  beforeData?: GibsStageData
): GibsStageData => {
  // From Front to Back positions (1-8) -> Calculate Left/Right
  const calculatedLeftTop = calculateAverage([data.position1, data.position2]);
  const calculatedLeftBottom = calculateAverage([data.position3, data.position4]);
  const calculatedRightTop = calculateAverage([data.position5, data.position6]);
  const calculatedRightBottom = calculateAverage([data.position7, data.position8]);

  // From Left to Right positions (9-16) -> Calculate Front/Back
  const calculatedFrontTop = calculateAverage([data.position9, data.position10]);
  const calculatedFrontBottom = calculateAverage([data.position11, data.position12]);
  const calculatedBackTop = calculateAverage([data.position13, data.position14]);
  const calculatedBackBottom = calculateAverage([data.position15, data.position16]);

  // Usable = average of all Front/Back values
  const calculatedUsable = calculateAverage([
    calculatedFrontTop,
    calculatedFrontBottom,
    calculatedBackTop,
    calculatedBackBottom
  ]);

  // Calculate differentials against Before Adjustment stage
  const differentialLeft = calculateDifferential(
    calculateAverage([calculatedLeftTop, calculatedLeftBottom]),
    calculateAverage([beforeData?.calculatedLeftTop, beforeData?.calculatedLeftBottom])
  );
  const differentialRight = calculateDifferential(
    calculateAverage([calculatedRightTop, calculatedRightBottom]),
    calculateAverage([beforeData?.calculatedRightTop, beforeData?.calculatedRightBottom])
  );

  return {
    ...data,
    calculatedLeftTop,
    calculatedLeftBottom,
    calculatedRightTop,
    calculatedRightBottom,
    calculatedFrontTop,
    calculatedFrontBottom,
    calculatedBackTop,
    calculatedBackBottom,
    calculatedUsable,
    differentialLeft,
    differentialRight,
  };
};

/**
 * OUTER SLIDE GIBS - After Tool Installation Tab
 */

// Stage 3: After Tool Installation
// Inputs: positions 1, 2, 5, 6 (top measurements)
// Outputs: Top Front (calculated from positions 1,2), Top Back (calculated from positions 5,6), Bottom Front, Bottom Back + comparison with Before
export const calculateOuterAfterInstallation = (
  data: GibsStageData,
  beforeData?: GibsStageData
): GibsStageData => {
  // Top Front calculated from positions 1 and 2
  const calculatedTopFront = calculateAverage([data.position1, data.position2]);
  // Top Back calculated from positions 5 and 6
  const calculatedTopBack = calculateAverage([data.position5, data.position6]);

  // Bottom calculated from positions 9-16 (Left to Right measurements)
  const calculatedBottomFront = calculateAverage([data.position9, data.position10, data.position11, data.position12]);
  const calculatedBottomBack = calculateAverage([data.position13, data.position14, data.position15, data.position16]);

  // Calculate differentials against Before Adjustment stage
  const differentialTopFront = calculateDifferential(calculatedTopFront, beforeData?.calculatedTopFront);
  const differentialTopBack = calculateDifferential(calculatedTopBack, beforeData?.calculatedTopBack);
  const differentialBottom = calculateDifferential(
    calculateAverage([calculatedBottomFront, calculatedBottomBack]),
    calculateAverage([beforeData?.calculatedBottomFront, beforeData?.calculatedBottomBack])
  );

  return {
    ...data,
    calculatedTopFront,
    calculatedTopBack,
    calculatedBottomFront,
    calculatedBottomBack,
    differentialTopFront,
    differentialTopBack,
    differentialBottom,
  };
};

/**
 * INNER SLIDE GIBS - 4 Stages
 */

// Stage 1: Before Adjustment
// Inputs: positions 9-16
// Outputs: Top, Bottom
export const calculateInnerBeforeAdjustment = (data: GibsStageData): GibsStageData => {
  const calculatedTopFront = calculateAverage([data.position9, data.position10]);
  const calculatedBottomFront = calculateAverage([data.position11, data.position12]);
  const calculatedTopBack = calculateAverage([data.position13, data.position14]);
  const calculatedBottomBack = calculateAverage([data.position15, data.position16]);

  return {
    ...data,
    calculatedTopFront,
    calculatedTopBack,
    calculatedBottomFront,
    calculatedBottomBack,
  };
};

// Stage 2: After Adjustment
// Inputs: positions 9-16 (recalculated)
// Outputs: Top, Bottom + differentials vs Before
export const calculateInnerAfterAdjustment = (
  data: GibsStageData,
  beforeData?: GibsStageData
): GibsStageData => {
  const calculatedTopFront = calculateAverage([data.position9, data.position10]);
  const calculatedBottomFront = calculateAverage([data.position11, data.position12]);
  const calculatedTopBack = calculateAverage([data.position13, data.position14]);
  const calculatedBottomBack = calculateAverage([data.position15, data.position16]);

  // Calculate differentials against Before Adjustment stage
  const differentialTopFront = calculateDifferential(calculatedTopFront, beforeData?.calculatedTopFront);
  const differentialTopBack = calculateDifferential(calculatedTopBack, beforeData?.calculatedTopBack);
  const differentialBottom = calculateDifferential(
    calculateAverage([calculatedBottomFront, calculatedBottomBack]),
    calculateAverage([beforeData?.calculatedBottomFront, beforeData?.calculatedBottomBack])
  );

  return {
    ...data,
    calculatedTopFront,
    calculatedTopBack,
    calculatedBottomFront,
    calculatedBottomBack,
    differentialTopFront,
    differentialTopBack,
    differentialBottom,
  };
};

// Stage 3: Before Tool Installation
// Inputs: positions 1-8
// Outputs: Left, Right, Top, Bottom
export const calculateInnerBeforeInstallation = (data: GibsStageData): GibsStageData => {
  const calculatedLeft = calculateAverage([data.position1, data.position2, data.position3, data.position4]);
  const calculatedRight = calculateAverage([data.position5, data.position6, data.position7, data.position8]);

  // Top and Bottom from left/right pairs
  const calculatedTopFront = calculateAverage([data.position1, data.position5]);
  const calculatedBottomFront = calculateAverage([data.position2, data.position6]);
  const calculatedTopBack = calculateAverage([data.position3, data.position7]);
  const calculatedBottomBack = calculateAverage([data.position4, data.position8]);

  return {
    ...data,
    calculatedLeft,
    calculatedRight,
    calculatedTopFront,
    calculatedTopBack,
    calculatedBottomFront,
    calculatedBottomBack,
  };
};

// Stage 4: After Tool Installation
// Inputs: positions 9-16
// Outputs: Top Front, Top Rear + comparison
export const calculateInnerAfterInstallation = (
  data: GibsStageData,
  beforeData?: GibsStageData
): GibsStageData => {
  const calculatedTopFront = calculateAverage([data.position9, data.position10]);
  const calculatedTopRear = calculateAverage([data.position13, data.position14]);
  const calculatedBottomFront = calculateAverage([data.position11, data.position12]);
  const calculatedBottomBack = calculateAverage([data.position15, data.position16]);

  // Calculate differentials against Before Installation stage
  const differentialTopFront = calculateDifferential(calculatedTopFront, beforeData?.calculatedTopFront);
  const differentialTopRear = calculateDifferential(calculatedTopRear, beforeData?.calculatedTopBack);
  const differentialBottom = calculateDifferential(
    calculateAverage([calculatedBottomFront, calculatedBottomBack]),
    calculateAverage([beforeData?.calculatedBottomFront, beforeData?.calculatedBottomBack])
  );

  return {
    ...data,
    calculatedTopFront,
    calculatedTopRear,
    calculatedBottomFront,
    calculatedBottomBack,
    differentialTopFront,
    differentialTopRear,
    differentialBottom,
  };
};

/**
 * Main hook for GIBS calculations
 */
export const useGibsCalculations = () => {
  return useMemo(
    () => ({
      calculateOuterBeforeAdjustment,
      calculateOuterAfterAdjustment,
      calculateOuterAfterInstallation,
      calculateInnerBeforeAdjustment,
      calculateInnerAfterAdjustment,
      calculateInnerBeforeInstallation,
      calculateInnerAfterInstallation,
    }),
    []
  );
};

/**
 * Hook for real-time stage calculation with memoization
 */
export const useGibsStageCalculation = (
  stageType: 'outerBeforeAdjustment' | 'outerAfterAdjustment' | 'outerAfterInstallation' |
             'innerBeforeAdjustment' | 'innerAfterAdjustment' | 'innerBeforeInstallation' | 'innerAfterInstallation',
  data: GibsStageData,
  comparisonData?: GibsStageData
): GibsStageData => {
  return useMemo(() => {
    switch (stageType) {
      case 'outerBeforeAdjustment':
        return calculateOuterBeforeAdjustment(data);
      case 'outerAfterAdjustment':
        return calculateOuterAfterAdjustment(data, comparisonData);
      case 'outerAfterInstallation':
        return calculateOuterAfterInstallation(data, comparisonData);
      case 'innerBeforeAdjustment':
        return calculateInnerBeforeAdjustment(data);
      case 'innerAfterAdjustment':
        return calculateInnerAfterAdjustment(data, comparisonData);
      case 'innerBeforeInstallation':
        return calculateInnerBeforeInstallation(data);
      case 'innerAfterInstallation':
        return calculateInnerAfterInstallation(data, comparisonData);
      default:
        return data;
    }
  }, [stageType, data, comparisonData]);
};
