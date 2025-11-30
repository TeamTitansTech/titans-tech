'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ServiceStatsCardsProps {
  totalServices: number;
  upcomingServices: number;
  completedThisMonth: number;
}

export function ServiceStatsCards({
  totalServices,
  upcomingServices,
  completedThisMonth,
}: ServiceStatsCardsProps) {
  const t = useTranslations('services.stats');

  const stats = [
    {
      label: t('totalServices'),
      value: totalServices,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: t('upcomingServices'),
      value: upcomingServices,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: t('completedThisMonth'),
      value: completedThisMonth,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
