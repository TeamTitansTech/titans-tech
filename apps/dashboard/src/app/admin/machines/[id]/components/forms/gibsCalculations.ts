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

  const frontTop = toNum(data.point1) + toNum(data.point2);
  const frontBottom = toNum(data.point3) + toNum(data.point4);
  const backTop = toNum(data.point5) + toNum(data.point6);
  const backBottom = toNum(data.point7) + toNum(data.point8);

  const leftTop = toNum(data.point9) + toNum(data.point13);
  const leftBottom = toNum(data.point11) + toNum(data.point15);
  const rightTop = toNum(data.point10) + toNum(data.point14);
  const rightBottom = toNum(data.point12) + toNum(data.point16);

  const isNum = (val: number | undefined): boolean => typeof val === 'number' && !isNaN(val);

  const topPointsCount = [data.point9, data.point10, data.point13, data.point14].filter(
    isNum,
  ).length;

  const bottomPointsCount = [data.point11, data.point12, data.point15, data.point16].filter(
    isNum,
  ).length;

  let usable: number | undefined;

  if (topPointsCount === 4 && bottomPointsCount === 4) {
    const minLeft = Math.min(
      toNum(data.point9),
      toNum(data.point11),
      toNum(data.point13),
      toNum(data.point15),
    );
    const minRight = Math.min(
      toNum(data.point10),
      toNum(data.point12),
      toNum(data.point14),
      toNum(data.point16),
    );
    usable = minLeft + minRight;
  } else if (topPointsCount === 4) {
    const minTopLeft = Math.min(toNum(data.point9), toNum(data.point13));
    const minTopRight = Math.min(toNum(data.point10), toNum(data.point14));
    usable = minTopLeft + minTopRight;
  } else if (bottomPointsCount === 4) {
    const minBottomLeft = Math.min(toNum(data.point11), toNum(data.point15));
    const minBottomRight = Math.min(toNum(data.point12), toNum(data.point16));
    usable = minBottomLeft + minBottomRight;
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
