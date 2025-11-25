'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { AlertSeverity as AlertSeverityEnum } from '@titans-tech/shared/enums';

interface Alert {
  id: string;
  machineName: string;
  machineId: string;
  severity: AlertSeverityEnum;
  message: string;
  createdAt: string;
}

interface RequiresAttentionProps {
  alerts: Alert[];
}

export function RequiresAttention({ alerts }: RequiresAttentionProps) {
  const t = useTranslations('dashboard.client');

  // Don't render if no alerts
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          {t('requiresAttention.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <Link
              key={alert.id}
              href={`/machines/${alert.machineId}`}
              className="block p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'RED'
                      ? 'text-red-600'
                      : alert.severity === 'YELLOW'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{alert.machineName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {alerts.length > 5 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              {t('requiresAttention.more', { count: alerts.length - 5 })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
