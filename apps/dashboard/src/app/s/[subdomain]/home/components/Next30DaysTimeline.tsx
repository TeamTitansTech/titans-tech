'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format, parseISO, isToday, isTomorrow, addDays, startOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ServiceType as ServiceTypeEnum } from '@titans-tech/shared/enums';
import { useInternalRouter } from '@/hooks/useInternalRouter';

interface UpcomingService {
  id: string;
  machineName: string;
  machineId: string;
  branchName: string;
  date: string;
  type: ServiceTypeEnum;
}

interface Next30DaysTimelineProps {
  services: UpcomingService[];
}

export function Next30DaysTimeline({ services }: Next30DaysTimelineProps) {
  const t = useTranslations('dashboard.client');
  const router = useInternalRouter();

  // Filter services for next 30 days
  const today = startOfDay(new Date());
  const next30Days = addDays(today, 30);

  const upcomingServices = services
    .filter((service) => {
      const serviceDate = parseISO(service.date);
      return serviceDate >= today && serviceDate <= next30Days;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 10);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return t('timeline.today');
    if (isTomorrow(date)) return t('timeline.tomorrow');
    return format(date, 'EEE, dd MMM', { locale: pt });
  };

  const handleServiceClick = (machineId: string) => {
    router.push(`/machines/${machineId}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t('timeline.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingServices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('timeline.noServices')}
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingServices.map((service, index) => (
              <div
                key={service.id}
                className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => handleServiceClick(service.machineId)}
              >
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {index < upcomingServices.length - 1 && (
                    <div className="w-0.5 h-full min-h-[20px] bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-medium">{service.machineName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getDateLabel(service.date)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    service.type === 'MAINTENANCE'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                  }`}
                >
                  {service.type === 'MAINTENANCE'
                    ? t('timeline.maintenance')
                    : t('timeline.inspection')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
