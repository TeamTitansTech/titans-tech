'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ThresholdConfig, AlertSeverity } from '@/components/charts/types';
import { calculateSeverity } from '@/components/charts/utils';

export type SectionStatus = 'ok' | 'warning' | 'alert';

interface MeasurementWithThreshold {
  value: number | null | undefined;
  threshold: ThresholdConfig | null | undefined;
}

interface SectionStatusBadgeProps {
  /** Array of measurements with their corresponding thresholds */
  measurements?: MeasurementWithThreshold[];
  /** Direct status override (useful for sections without threshold-based alerts) */
  status?: SectionStatus;
  /** Show text label alongside the icon */
  showLabel?: boolean;
  /** Size of the badge */
  size?: 'sm' | 'default' | 'lg';
  /** Additional class names */
  className?: string;
}

const statusConfig = {
  ok: {
    icon: CheckCircle,
    labelKey: 'ok',
    badgeClass:
      'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  warning: {
    icon: AlertTriangle,
    labelKey: 'warning',
    badgeClass:
      'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
  alert: {
    icon: AlertCircle,
    labelKey: 'critical',
    badgeClass:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    iconClass: 'text-red-600 dark:text-red-400',
  },
};

const sizeConfig = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'h-3 w-3' },
  default: { badge: 'px-2.5 py-1 text-sm', icon: 'h-4 w-4' },
  lg: { badge: 'px-3 py-1.5 text-base', icon: 'h-5 w-5' },
};

/**
 * Calculate section status from an array of measurements with thresholds.
 * Returns the worst-case severity.
 */
export function calculateSectionStatus(measurements: MeasurementWithThreshold[]): SectionStatus {
  const severities: AlertSeverity[] = measurements.map((m) =>
    calculateSeverity(m.value, m.threshold ?? null),
  );

  // Return worst status found
  if (severities.includes('RED')) return 'alert';
  if (severities.includes('YELLOW')) return 'warning';

  // No data (NONE) or all GREEN = ok
  return 'ok';
}

/**
 * A badge component that displays the overall status of a section
 * based on multiple measurements and their thresholds.
 */
export function SectionStatusBadge({
  measurements,
  status: statusProp,
  showLabel = true,
  size = 'default',
  className,
}: SectionStatusBadgeProps) {
  const t = useTranslations('sectionStatus');
  const calculatedStatus = useMemo(
    () => (measurements ? calculateSectionStatus(measurements) : 'ok'),
    [measurements],
  );
  const status = statusProp ?? calculatedStatus;

  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border gap-1.5 flex items-center',
        config.badgeClass,
        sizeStyles.badge,
        className,
      )}
    >
      <Icon className={cn(sizeStyles.icon, config.iconClass)} />
      {showLabel && <span>{t(config.labelKey)}</span>}
    </Badge>
  );
}

/**
 * A simple status dot indicator for compact displays
 */
export function SectionStatusDot({
  measurements,
  className,
}: {
  measurements: MeasurementWithThreshold[];
  className?: string;
}) {
  const status = useMemo(() => calculateSectionStatus(measurements), [measurements]);

  const dotColors = {
    ok: 'bg-green-500',
    warning: 'bg-yellow-500',
    alert: 'bg-red-500',
  };

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-background',
        dotColors[status],
        status === 'ok' && 'ring-green-500/30',
        status === 'warning' && 'ring-yellow-500/30',
        status === 'alert' && 'ring-red-500/30 animate-pulse',
        className,
      )}
    />
  );
}
