'use client';

import { type ReactNode } from 'react';
import { UnitManagerProvider, type LengthUnit } from '@/contexts/UnitManagerContext';
import { useBranchSafe } from '@/contexts/BranchContext';

interface BranchAwareUnitManagerProviderProps {
  children: ReactNode;
}

/**
 * A wrapper around UnitManagerProvider that automatically uses the
 * defaultMeasurementUnit from the selected branch context.
 *
 * Use this component in place of UnitManagerProvider when you want
 * the unit defaults to respect the branch's configured preference.
 *
 * Falls back to 'inches' if:
 * - No branch context is available (e.g., in admin panel)
 * - No branch is selected
 * - Branch doesn't have a configured default
 */
export function BranchAwareUnitManagerProvider({ children }: BranchAwareUnitManagerProviderProps) {
  const branchContext = useBranchSafe();

  // Convert branch default unit (INCHES/MM) to UnitManager format (inches/mm)
  const defaultLengthUnit: LengthUnit =
    branchContext?.defaultMeasurementUnit === 'MM' ? 'mm' : 'inches';

  return (
    <UnitManagerProvider defaultLengthUnit={defaultLengthUnit}>{children}</UnitManagerProvider>
  );
}
