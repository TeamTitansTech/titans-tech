'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getAlertStatus, type AlertStatus } from '@/lib/alertStatus';
import type { Machine } from '@/data/services/machines.api';

interface MachineHealthGridProps {
  machines: Machine[];
}

export function MachineHealthGrid({ machines }: MachineHealthGridProps) {
  const t = useTranslations('dashboard.client');

  // Calculate health status from actual alert data
  const machinesWithStatus = machines.map((machine) => {
    const healthStatus = getAlertStatus(machine);
    return { ...machine, healthStatus };
  });

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          Icon: AlertTriangle,
        };
      case 'unknown':
        return {
          bg: 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          Icon: CheckCircle2,
        };
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          Icon: CheckCircle2,
        };
    }
  };

  // Calculate stats from actual machine data
  const stats = {
    operational: machinesWithStatus.filter((m) => m.healthStatus === 'ok').length,
    warning: machinesWithStatus.filter((m) => m.healthStatus === 'warning').length,
    critical: machinesWithStatus.filter((m) => m.healthStatus === 'critical').length,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('machineHealth.title')}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">{stats.operational}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">{stats.warning}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">{stats.critical}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {machinesWithStatus.slice(0, 12).map((machine) => {
            const statusConfig = getStatusColor(machine.healthStatus || 'ok');
            const StatusIcon = statusConfig.Icon;

            return (
              <Link
                key={machine.id}
                href={`/machines/${machine.id}`}
                className={`p-3 rounded-lg border-2 ${statusConfig.bg} hover:shadow-md transition-all group`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <StatusIcon className={`h-5 w-5 ${statusConfig.icon}`} />
                  <span className="text-xs font-medium line-clamp-2 group-hover:underline">
                    {machine.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {machines.length > 12 && (
          <Link
            href="/machines"
            className="block mt-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            +{machines.length - 12} {t('machineHealth.more')}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
