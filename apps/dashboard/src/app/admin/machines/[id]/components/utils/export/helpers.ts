import type { GibsStageData, SlideData } from './types';

// Helper function to format field names
export const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to display value or "-" for empty
export const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
};

// Helper function to translate enum values
export const translateEnumValue = (
  value: unknown,
  translations: {
    yes: string;
    no: string;
    dnc: string;
    na: string;
  },
): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? translations.yes : translations.no;
  }
  const stringValue = String(value);
  if (stringValue === 'YES') return translations.yes;
  if (stringValue === 'NO') return translations.no;
  if (stringValue === 'DNC') return translations.dnc;
  if (stringValue === 'NA') return translations.na;
  return stringValue;
};

// Helper function to calculate max deviation from slide position data
export const calculateMaxDeviation = (data: Record<string, unknown>): string => {
  if (!data) return '-';

  const positions = [
    data.position1,
    data.position2,
    data.position3,
    data.position4,
    data.position5,
    data.position6,
  ];

  // Convert to numbers if they are numeric values (including string numbers and Decimal objects)
  const numericValues = positions.map((val) =>
    val !== null && val !== undefined ? Number(val) : NaN,
  );

  const validValues = numericValues.filter((val): val is number => !isNaN(val));

  if (validValues.length > 1) {
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    return (max - min).toFixed(4);
  }
  return '-';
};

// Helper function to calculate slide max deviation from before/after positions
export const calculateSlideMaxDeviation = (
  slideData: SlideData,
  fieldPrefix: 'before' | 'after',
): string => {
  const positions = [1, 2, 3, 4, 5].map((pos) => {
    const fieldName = `${fieldPrefix}Position${pos}` as keyof SlideData;
    return slideData[fieldName] as number | undefined;
  });

  const validValues = positions.filter(
    (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
  ) as number[];

  if (validValues.length > 1) {
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    return (max - min).toFixed(4);
  }
  return '-';
};

// Helper function to extract bearing measurement rows
export const extractBearingRows = (data: unknown) => {
  if (!data || typeof data !== 'object') return [];
  const dataObj = data as Record<string, unknown>;

  const rows: {
    field: string;
    lh: unknown;
    rh: unknown;
    differential: string;
  }[] = [];
  const processedFields = new Set<string>();

  // Fields to skip (non-measurement fields)
  const skipFields = [
    'hasBeenAdjusted',
    'combinedWith',
    'matingPart',
    'slideMotorMounts',
    'powerCordHoses',
    'chainsGearsSprockets',
    'lockingClamps',
    'notes',
    'id',
    'createdAt',
    'updatedAt',
  ];

  Object.keys(dataObj).forEach((key) => {
    if (skipFields.includes(key)) {
      return;
    }

    const baseField = key.replace(/_RH$|_LH$/, '');

    if (!processedFields.has(baseField)) {
      processedFields.add(baseField);
      const lhValue = dataObj[`${baseField}_LH`];
      const rhValue = dataObj[`${baseField}_RH`];

      let differential = '-';
      // Convert to number if they are numeric values (including string numbers and Decimal objects)
      const lhNum = lhValue !== null && lhValue !== undefined ? Number(lhValue) : NaN;
      const rhNum = rhValue !== null && rhValue !== undefined ? Number(rhValue) : NaN;

      if (!isNaN(lhNum) && !isNaN(rhNum)) {
        const diff = Math.abs(rhNum - lhNum);
        differential = diff.toFixed(4);
      }

      rows.push({
        field: baseField,
        lh: lhValue,
        rh: rhValue,
        differential,
      });
    }
  });

  return rows;
};

// Helper function to check if data has actual values
export const hasActualData = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;

  return Object.entries(data as Record<string, unknown>).some(([key, value]) => {
    if (key === 'hasBeenAdjusted' || key === 'combinedWith' || key === 'matingPart') {
      return value !== '' && value !== null && value !== undefined;
    }
    return typeof value === 'number' && !isNaN(value);
  });
};

// Calculate Gibs fields
export const calculateGibsFields = (stageData: GibsStageData) => {
  const toNum = (val: number | undefined) => (typeof val === 'number' ? val : 0);
  const isNum = (val: number | undefined): boolean => typeof val === 'number' && !isNaN(val);

  const frontTop = toNum(stageData.point1) + toNum(stageData.point2);
  const frontBottom = toNum(stageData.point3) + toNum(stageData.point4);
  const backTop = toNum(stageData.point5) + toNum(stageData.point6);
  const backBottom = toNum(stageData.point7) + toNum(stageData.point8);
  const leftTop = toNum(stageData.point9) + toNum(stageData.point13);
  const leftBottom = toNum(stageData.point11) + toNum(stageData.point15);
  const rightTop = toNum(stageData.point10) + toNum(stageData.point14);
  const rightBottom = toNum(stageData.point12) + toNum(stageData.point16);

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

  let usable: number | undefined;

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
    usable = minLeft + minRight;
  } else if (topPointsCount === 4) {
    const minTopLeft = Math.min(toNum(stageData.point9), toNum(stageData.point13));
    const minTopRight = Math.min(toNum(stageData.point10), toNum(stageData.point14));
    usable = minTopLeft + minTopRight;
  } else if (bottomPointsCount === 4) {
    const minBottomLeft = Math.min(toNum(stageData.point11), toNum(stageData.point15));
    const minBottomRight = Math.min(toNum(stageData.point12), toNum(stageData.point16));
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
};
