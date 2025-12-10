'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ClipboardCheck, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { ServiceType as ServiceTypeEnum } from '@titans-tech/shared/enums';
import { useInternalRouter } from '@/hooks/useInternalRouter';

interface CompletedService {
  id: string;
  machineName: string;
  machineId: string;
  date: string;
  type: ServiceTypeEnum;
}

interface RecentCompletedServicesProps {
  services: CompletedService[];
}

export function RecentCompletedServices({ services }: RecentCompletedServicesProps) {
  const t = useTranslations('dashboard.client');
  const router = useInternalRouter();

  const handleServiceClick = (machineId: string) => {
    router.push(`/machines/${machineId}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {t('recentCompleted.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('recentCompleted.noServices')}
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => handleServiceClick(service.machineId)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      service.type === 'MAINTENANCE'
                        ? 'bg-orange-50 dark:bg-orange-950'
                        : 'bg-blue-50 dark:bg-blue-950'
                    }`}
                  >
                    {service.type === 'MAINTENANCE' ? (
                      <Wrench className="h-4 w-4 text-orange-600" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{service.machineName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(service.date), 'dd MMM yyyy', { locale: pt })}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    service.type === 'MAINTENANCE'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                  }`}
                >
                  {service.type === 'MAINTENANCE'
                    ? t('recentCompleted.maintenance')
                    : t('recentCompleted.inspection')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
