'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Calendar, Wrench, ClipboardList, Clock } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { ServiceType, type ServiceType as ServiceTypeEnum } from '@titans-tech/shared/enums';

interface Service {
  id: string;
  machineName: string;
  machineId: string;
  branchName: string;
  date: string;
  type: ServiceTypeEnum;
}

interface UpcomingServicesTimelineProps {
  services: Service[];
}

export function UpcomingServicesTimeline({ services }: UpcomingServicesTimelineProps) {
  const t = useTranslations('dashboard.client.upcomingServices');
  const locale = useLocale();

  const dateLocale = locale === 'pt' ? ptBR : locale === 'es' ? es : enUS;

  // Memoize current date calculations to avoid impure function calls during render
  const { todayStr, tomorrowStr } = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    return {
      todayStr: format(now, 'yyyy-MM-dd'),
      tomorrowStr: format(tomorrow, 'yyyy-MM-dd'),
    };
  }, []);

  // Sort by date and take next 7 days
  const upcomingServices = useMemo(
    () =>
      services
        .filter((service) => new Date(service.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 6),
    [services],
  );

  if (upcomingServices.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-blue-50 p-3 mb-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">{t('noServices')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingServices.map((service, index) => {
            const isInspection = service.type === ServiceType.INSPECTION;
            const ServiceIcon = isInspection ? ClipboardList : Wrench;
            const serviceDate = new Date(service.date);
            const serviceDateStr = format(serviceDate, 'yyyy-MM-dd');
            const isToday = serviceDateStr === todayStr;
            const isTomorrow = serviceDateStr === tomorrowStr;

            return (
              <Link
                key={service.id}
                href={`/services`}
                className="block hover:bg-accent rounded-lg transition-colors"
                data-testid={`timeline-upcoming-service-${service.id}`}
              >
                <div className="flex items-start gap-4 p-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-lg p-2 ${isInspection ? 'bg-blue-50' : 'bg-orange-50'}`}
                    >
                      <ServiceIcon
                        className={`h-4 w-4 ${isInspection ? 'text-blue-600' : 'text-orange-600'}`}
                      />
                    </div>
                    {index < upcomingServices.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{service.machineName}</p>
                        <p className="text-xs text-muted-foreground">{service.branchName}</p>
                      </div>
                      <Badge variant={isInspection ? 'default' : 'secondary'} className="text-xs">
                        {t(isInspection ? 'types.inspection' : 'types.maintenance')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      {isToday ? (
                        <span className="font-medium text-orange-600">{t('today')}</span>
                      ) : isTomorrow ? (
                        <span className="font-medium text-blue-600">{t('tomorrow')}</span>
                      ) : (
                        <>
                          <span>{format(serviceDate, 'MMM d, yyyy', { locale: dateLocale })}</span>
                          <span className="text-muted-foreground/60">
                            (
                            {formatDistanceToNow(serviceDate, {
                              addSuffix: true,
                              locale: dateLocale,
                            })}
                            )
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {services.length > 6 && (
          <div className="mt-4 pt-4 border-t">
            <Link
              href="/services"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              {t('viewAll', { count: services.length })}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
