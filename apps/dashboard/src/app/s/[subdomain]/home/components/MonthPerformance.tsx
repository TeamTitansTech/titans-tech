'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wrench, ClipboardCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MonthPerformanceProps {
  preventiveCount: number;
  correctiveCount: number;
  availability: number;
}

export function MonthPerformance({
  preventiveCount,
  correctiveCount,
  availability,
}: MonthPerformanceProps) {
  const t = useTranslations('dashboard.client');

  const stats = [
    {
      label: t('performance.availability'),
      value: `${availability.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: t('performance.preventive'),
      value: preventiveCount,
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: t('performance.corrective'),
      value: correctiveCount,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t('performance.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
