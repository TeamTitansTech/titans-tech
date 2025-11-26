'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertSeverity, type AlertSeverity as AlertSeverityEnum } from '@titans-tech/shared/enums';

interface Alert {
  id: string;
  machineName: string;
  machineId: string;
  severity: AlertSeverityEnum;
  message: string;
  createdAt: string;
}

interface ActiveAlertsProps {
  alerts: Alert[];
}

export function ActiveAlerts({ alerts }: ActiveAlertsProps) {
  const t = useTranslations('dashboard.client.activeAlerts');

  // Show only critical and warning alerts
  const importantAlerts = alerts
    .filter(
      (alert) => alert.severity === AlertSeverity.RED || alert.severity === AlertSeverity.YELLOW,
    )
    .slice(0, 5); // Show max 5

  const getSeverityConfig = (severity: AlertSeverityEnum) => {
    switch (severity) {
      case AlertSeverity.RED:
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          badge: 'destructive' as const,
          label: t('severity.critical'),
        };
      case AlertSeverity.YELLOW:
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          badge: 'secondary' as const,
          label: t('severity.warning'),
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          badge: 'secondary' as const,
          label: t('severity.info'),
        };
    }
  };

  if (importantAlerts.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-50 p-3 mb-3">
              <Info className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">{t('noAlerts')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Badge variant="destructive">{importantAlerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {importantAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;

            return (
              <Link
                key={alert.id}
                href={`/machines/${alert.machineId}`}
                className="block hover:bg-accent rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3 p-3">
                  <div className={`${config.bg} rounded-lg p-2`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{alert.machineName}</p>
                      <Badge variant={config.badge} className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {alerts.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/machines">{t('viewAll', { count: alerts.length })}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
