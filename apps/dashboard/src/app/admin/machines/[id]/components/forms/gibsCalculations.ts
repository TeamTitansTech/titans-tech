import { GibsStageData } from '@/data/types/services.types';

export interface GibsCalculatedFields {
  frontTop: number;
  frontBottom: number;
  backTop: number;
  backBottom: number;
  leftTop: number;
  leftBottom: number;
  rightTop: number;
  rightBottom: number;
  usable?: number;
}

export function calculateGibsFields(data: GibsStageData): GibsCalculatedFields {
  const toNum = (val: number | undefined): number => (typeof val === 'number' ? val : 0);

  // Front to Back calculations
  // top left: 1 + 2
  // top right: 6 + 5
  // bottom left: 3 + 4
  // bottom right: 7 + 8
  const frontTop = toNum(data.point1) + toNum(data.point2);
  const frontBottom = toNum(data.point3) + toNum(data.point4);
  const backTop = toNum(data.point6) + toNum(data.point5);
  const backBottom = toNum(data.point7) + toNum(data.point8);

  // Left to Right calculations
  // front top: 9 + 10
  // front bottom: 11 + 12
  // back top: 13 + 14
  // back bottom: 15 + 16
  const leftTop = toNum(data.point9) + toNum(data.point10);
  const leftBottom = toNum(data.point11) + toNum(data.point12);
  const rightTop = toNum(data.point13) + toNum(data.point14);
  const rightBottom = toNum(data.point15) + toNum(data.point16);

  const isNum = (val: number | undefined): boolean => typeof val === 'number' && !isNaN(val);

  // Count how many values we have for usable calculation
  // All 8 points: 13, 9, 14, 10, 15, 16, 11, 12
  const allPointsCount = [
    data.point13,
    data.point9,
    data.point14,
    data.point10,
    data.point15,
    data.point16,
    data.point11,
    data.point12,
  ].filter(isNum).length;

  // Back points: 13, 14, 15, 16
  const backPointsCount = [data.point13, data.point14, data.point15, data.point16].filter(
    isNum,
  ).length;

  // Front points: 9, 11, 10, 12
  const frontPointsCount = [data.point9, data.point11, data.point10, data.point12].filter(
    isNum,
  ).length;

  let usable: number | undefined;

  // Excel formula logic:
  // IF(COUNT(13,9,14,10,15,16,11,12)=8, MIN(13,9,15,11)+MIN(14,10,16,12),
  //   IF(COUNT(13,14,15,16)=4, MIN(13,15)+MIN(14,16),
  //     IF(COUNT(9,11,10,12)=4, MIN(9,11)+MIN(10,12), "")))
  if (allPointsCount === 8) {
    const minLeft = Math.min(
      toNum(data.point13),
      toNum(data.point9),
      toNum(data.point15),
      toNum(data.point11),
    );
    const minRight = Math.min(
      toNum(data.point14),
      toNum(data.point10),
      toNum(data.point16),
      toNum(data.point12),
    );
    usable = minLeft + minRight;
  } else if (backPointsCount === 4) {
    const minBackLeft = Math.min(toNum(data.point13), toNum(data.point15));
    const minBackRight = Math.min(toNum(data.point14), toNum(data.point16));
    usable = minBackLeft + minBackRight;
  } else if (frontPointsCount === 4) {
    const minFrontLeft = Math.min(toNum(data.point9), toNum(data.point11));
    const minFrontRight = Math.min(toNum(data.point10), toNum(data.point12));
    usable = minFrontLeft + minFrontRight;
  }

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
