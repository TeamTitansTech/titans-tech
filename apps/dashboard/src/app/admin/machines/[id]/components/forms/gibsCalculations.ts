import { GibsStageData, GibsCalculatedFields } from '@/data/types/services.types';

/**
 * Calculate directional fields from 16 measurement points
 * Following the Excel structure where:
 * - Points 1-8: Front to Back
 * - Points 9-16: Left to Right
 */
export function calculateGibsFields(data: GibsStageData): GibsCalculatedFields {
  // Front to Back (points 1-8)
  const frontTop = data.point1 + data.point2; // columns 1+2
  const frontBottom = data.point3 + data.point4; // columns 3+4
  const backTop = data.point5 + data.point6; // columns 5+6
  const backBottom = data.point7 + data.point8; // columns 7+8

  // Left to Right (points 9-16)
  const leftTop = data.point9 + data.point13; // columns 9+13
  const leftBottom = data.point11 + data.point15; // columns 11+15
  const rightTop = data.point10 + data.point14; // columns 10+14
  const rightBottom = data.point12 + data.point16; // columns 12+16

  // Usable calculation - based on Left to Right values
  const usable = (leftTop + leftBottom + rightTop + rightBottom) / 4;

  return {
    frontTop,
    frontBottom,
    backTop,
    backBottom,
    leftTop,
    leftBottom,
    rightTop,
    rightBottom,
    usable,
  };
}

/**
 * Get a specific subset of points for a measurement type
 */
export function getPointsForMeasurement(
  data: GibsStageData,
  type: 'frontToBack' | 'leftToRight',
): Partial<GibsStageData> {
  if (type === 'frontToBack') {
    return {
      point1: data.point1,
      point2: data.point2,
      point3: data.point3,
      point4: data.point4,
      point5: data.point5,
      point6: data.point6,
      point7: data.point7,
      point8: data.point8,
    };
  } else {
    return {
      point9: data.point9,
      point10: data.point10,
      point11: data.point11,
      point12: data.point12,
      point13: data.point13,
      point14: data.point14,
      point15: data.point15,
      point16: data.point16,
    };
  }
}
