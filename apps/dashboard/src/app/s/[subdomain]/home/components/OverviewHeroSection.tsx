'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Package, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OverviewHeroSectionProps {
  totalMachines: number;
  upcomingServicesCount: number;
  activeAlertsCount: number;
}

export function OverviewHeroSection({
  totalMachines,
  upcomingServicesCount,
  activeAlertsCount,
}: OverviewHeroSectionProps) {
  const t = useTranslations('dashboard.client');

  const stats = [
    {
      label: t('overview.machines'),
      value: totalMachines,
      subtitle: t('overview.operating'),
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: t('overview.services'),
      value: upcomingServicesCount,
      subtitle:
        upcomingServicesCount === 1 ? t('overview.scheduled') : t('overview.scheduled_plural'),
      icon: Calendar,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      label: t('overview.alerts'),
      value: activeAlertsCount,
      subtitle: activeAlertsCount === 0 ? t('overview.allOk') : t('overview.requiresAttention'),
      icon: activeAlertsCount === 0 ? CheckCircle2 : AlertTriangle,
      iconColor: activeAlertsCount === 0 ? 'text-green-600' : 'text-red-600',
      bgColor:
        activeAlertsCount === 0 ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
