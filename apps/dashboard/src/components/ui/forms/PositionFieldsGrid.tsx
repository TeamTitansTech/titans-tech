'use client';

import { cn } from '@/lib/utils';
import { NumericInput } from './NumericInput';
import { useTranslations } from 'next-intl';

export interface PositionFieldsGridProps {
  position1: number | string;
  position2: number | string;
  position3: number | string;
  position4: number | string;
  position5: number | string;
  position6: number | string;
  onPositionChange: (position: 1 | 2 | 3 | 4 | 5 | 6, value: number) => void;
  maxDeviation?: string;
  maxDeviationLabel?: string;
  positionLabels?: {
    pos1?: string;
    pos2?: string;
    pos3?: string;
    pos4?: string;
    pos5?: string;
    pos6?: string;
  };
  errors?: {
    position1?: string;
    position2?: string;
    position3?: string;
    position4?: string;
    position5?: string;
    position6?: string;
  };
  className?: string;
  idPrefix?: string;
  layout?: 'lg' | 'md' | 'sm'; // lg: 4+2 cols, md: 2+2 cols, sm: 1 col
}

export function PositionFieldsGrid({
  position1,
  position2,
  position3,
  position4,
  position5,
  position6,
  onPositionChange,
  maxDeviation,
  maxDeviationLabel,
  positionLabels = {},
  errors = {},
  className,
  idPrefix = '',
  layout = 'lg',
}: PositionFieldsGridProps) {
  const t = useTranslations('forms.positions');

  const {
    pos1 = t('position1'),
    pos2 = t('position2'),
    pos3 = t('position3'),
    pos4 = t('position4'),
    pos5 = t('position5'),
    pos6 = t('position6'),
  } = positionLabels;

  const maxDeviationLabelFinal = maxDeviationLabel || t('maxDeviation');

  // Large screens: 4 columns + deviation
  if (layout === 'lg') {
    return (
      <div className={cn('hidden lg:grid lg:grid-cols-4 gap-4', className)}>
        {/* Row 1: position1, position2, position3, deviation label */}
        <NumericInput
          id={`${idPrefix}position1`}
          label={pos1}
          value={position1}
          onChange={(value) => onPositionChange(1, value)}
          error={errors.position1}
        />
        <NumericInput
          id={`${idPrefix}position2`}
          label={pos2}
          value={position2}
          onChange={(value) => onPositionChange(2, value)}
          error={errors.position2}
        />
        <NumericInput
          id={`${idPrefix}position3`}
          label={pos3}
          value={position3}
          onChange={(value) => onPositionChange(3, value)}
          error={errors.position3}
        />
        <div className="space-y-1">
          <label className="text-xs font-medium block">{maxDeviationLabelFinal}</label>
          <div className="h-9 flex items-center justify-center text-xs font-semibold bg-blue-50 dark:bg-blue-950 rounded-md border-2 border-blue-200 dark:border-blue-800">
            {maxDeviation || '-'}
          </div>
        </div>
        {/* Row 2: position4, position5, position6, deviation calc */}
        <NumericInput
          id={`${idPrefix}position4`}
          label={pos4}
          value={position4}
          onChange={(value) => onPositionChange(4, value)}
          error={errors.position4}
        />
        <NumericInput
          id={`${idPrefix}position5`}
          label={pos5}
          value={position5}
          onChange={(value) => onPositionChange(5, value)}
          error={errors.position5}
        />
        <NumericInput
          id={`${idPrefix}position6`}
          label={pos6}
          value={position6}
          onChange={(value) => onPositionChange(6, value)}
          error={errors.position6}
        />
        <div /> {/* Empty cell */}
      </div>
    );
  }

  // Medium screens: 2 columns + deviation
  if (layout === 'md') {
    return (
      <div className={cn('hidden md:grid lg:hidden md:grid-cols-3 gap-4', className)}>
        {/* Row 1: position1, position2, deviation label */}
        <NumericInput
          id={`${idPrefix}position1`}
          label={pos1}
          value={position1}
          onChange={(value) => onPositionChange(1, value)}
          error={errors.position1}
        />
        <NumericInput
          id={`${idPrefix}position2`}
          label={pos2}
          value={position2}
          onChange={(value) => onPositionChange(2, value)}
          error={errors.position2}
        />
        <div className="space-y-1">
          <label className="text-xs font-medium block">{maxDeviationLabelFinal}</label>
          <div className="h-9 flex items-center justify-center text-xs font-semibold bg-blue-50 dark:bg-blue-950 rounded-md border-2 border-blue-200 dark:border-blue-800">
            {maxDeviation || '-'}
          </div>
        </div>
        {/* Row 2: position3, position4, deviation calc */}
        <NumericInput
          id={`${idPrefix}position3`}
          label={pos3}
          value={position3}
          onChange={(value) => onPositionChange(3, value)}
          error={errors.position3}
        />
        <NumericInput
          id={`${idPrefix}position4`}
          label={pos4}
          value={position4}
          onChange={(value) => onPositionChange(4, value)}
          error={errors.position4}
        />
        <div /> {/* Empty cell */}
        {/* Row 3: position5, position6 */}
        <NumericInput
          id={`${idPrefix}position5`}
          label={pos5}
          value={position5}
          onChange={(value) => onPositionChange(5, value)}
          error={errors.position5}
        />
        <NumericInput
          id={`${idPrefix}position6`}
          label={pos6}
          value={position6}
          onChange={(value) => onPositionChange(6, value)}
          error={errors.position6}
        />
        <div /> {/* Empty cell */}
      </div>
    );
  }

  // Small screens: 1 column stacked
  return (
    <div className={cn('grid md:hidden grid-cols-1 gap-4', className)}>
      <NumericInput
        id={`${idPrefix}position1`}
        label={pos1}
        value={position1}
        onChange={(value) => onPositionChange(1, value)}
        error={errors.position1}
      />
      <NumericInput
        id={`${idPrefix}position2`}
        label={pos2}
        value={position2}
        onChange={(value) => onPositionChange(2, value)}
        error={errors.position2}
      />
      <NumericInput
        id={`${idPrefix}position3`}
        label={pos3}
        value={position3}
        onChange={(value) => onPositionChange(3, value)}
        error={errors.position3}
      />
      <NumericInput
        id={`${idPrefix}position4`}
        label={pos4}
        value={position4}
        onChange={(value) => onPositionChange(4, value)}
        error={errors.position4}
      />
      <NumericInput
        id={`${idPrefix}position5`}
        label={pos5}
        value={position5}
        onChange={(value) => onPositionChange(5, value)}
        error={errors.position5}
      />
      <NumericInput
        id={`${idPrefix}position6`}
        label={pos6}
        value={position6}
        onChange={(value) => onPositionChange(6, value)}
        error={errors.position6}
      />
      <div className="space-y-1">
        <label className="text-xs font-medium block">{maxDeviationLabel}</label>
        <div className="h-9 flex items-center justify-center text-xs font-semibold bg-blue-50 dark:bg-blue-950 rounded-md border-2 border-blue-200 dark:border-blue-800">
          {maxDeviation || '-'}
        </div>
      </div>
    </div>
  );
}
