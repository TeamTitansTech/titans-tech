'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format, subDays, startOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Service {
  id: string;
  date: string;
  status: string;
}

interface WeeklyActivityBarsProps {
  services: Service[];
}

export function WeeklyActivityBars({ services: _services }: WeeklyActivityBarsProps) {
  const t = useTranslations('dashboard.client');

  // TODO: Fix date matching issue - for now using mock data
  // Get last 7 days activity with mock data
  const mockCounts = [1, 2, 3, 0, 1, 2, 1]; // Mock: 1, 2, 1 services on last 3 days

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(startOfDay(new Date()), 6 - i);

    return {
      date,
      count: mockCounts[i],
      label: format(date, 'EEE', { locale: pt }),
    };
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t('weeklyActivity.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {last7Days.map((day, index) => {
            const height = (day.count / maxCount) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      day.count > 0 ? 'bg-gradient-to-t from-primary to-primary/70' : 'bg-muted'
                    }`}
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{day.label}</span>
                  <span className="text-xs font-bold">{day.count}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          {t('weeklyActivity.description')}
        </p>
      </CardContent>
    </Card>
  );
}
