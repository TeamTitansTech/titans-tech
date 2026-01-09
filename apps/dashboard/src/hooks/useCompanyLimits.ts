'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCompanyUsageStats } from '@/data/services/companies.api';

export interface CompanyUsage {
  branches: { current: number; max: number };
  users: { current: number; max: number };
  machines: { current: number; max: number };
  productionLines: { current: number; max: number };
}

export interface LimitCheck {
  isAtLimit: boolean;
  isNearLimit: boolean;
  current: number;
  max: number;
  percentage: number;
}

export function useCompanyLimits(companyId: string) {
  const [usage, setUsage] = useState<CompanyUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getCompanyUsageStats({ companyId });
      if (response.data) {
        setUsage(response.data.usage);
      } else {
        setError('Failed to load company limits');
      }
    } catch (err) {
      setError('Failed to load company limits');
      console.error('Error fetching company usage:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const getLimitCheck = useCallback(
    (resourceType: keyof CompanyUsage): LimitCheck => {
      if (!usage) {
        return {
          isAtLimit: true,
          isNearLimit: false,
          current: 0,
          max: Number.MAX_SAFE_INTEGER,
          percentage: 0,
        };
      }

      const resource = usage[resourceType];
      const percentage = resource.max > 0 ? (resource.current / resource.max) * 100 : 0;

      return {
        isAtLimit: percentage >= 100,
        isNearLimit: percentage >= 80,
        current: resource.current,
        max: resource.max,
        percentage,
      };
    },
    [usage],
  );

  const canCreateBranch = !getLimitCheck('branches').isAtLimit;
  const canCreateUser = !getLimitCheck('users').isAtLimit;
  const canCreateMachine = !getLimitCheck('machines').isAtLimit;
  const canCreateProductionLine = !getLimitCheck('productionLines').isAtLimit;

  return {
    usage,
    loading,
    error,
    getLimitCheck,
    canCreateBranch,
    canCreateUser,
    canCreateMachine,
    canCreateProductionLine,
    refreshUsage: fetchUsage,
  };
}
