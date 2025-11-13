'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CompleteServiceModal } from './CompleteServiceModal';
import type { Service } from '@/data/types/services.types';

interface ServiceHistoryWrapperProps {
  machineId: string;
  blueprintSections: string[];
  services: Service[];
}

export function ServiceHistoryWrapper({
  machineId,
  blueprintSections,
  services,
}: ServiceHistoryWrapperProps) {
  const t = useTranslations('machines');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Filter for past services (completed or past due pending services)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastServices = services.filter((service) => {
    const serviceDate = new Date(service.date);
    serviceDate.setHours(0, 0, 0, 0);
    // Show completed services or pending services that are past due
    return service.status === 'COMPLETED' || serviceDate < today;
  });

  const handleServiceClick = (service: Service) => {
    // Only allow clicking on pending services
    if (service.status === 'PENDING') {
      setSelectedService(service);
      setIsCompleteModalOpen(true);
    }
  };

  if (pastServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('serviceHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="muted" className="text-center py-8">
            {t('noServicesFound')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{t('serviceHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastServices.map((service) => {
              const serviceDate = new Date(service.date);
              const isCompleted = service.status === 'COMPLETED';
              const isPending = service.status === 'PENDING';

              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className={`flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0 ${
                    isPending
                      ? 'cursor-pointer hover:bg-muted transition-colors rounded-lg p-2 -m-2'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3 p-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <Typography variant="h4">
                        {service.type === 'MAINTENANCE'
                          ? t('maintenanceService')
                          : t('inspectionService')}
                      </Typography>
                      {service.performedBy && (
                        <Typography variant="small" className="text-muted-foreground">
                          {t('technician')}: {service.performedBy}
                        </Typography>
                      )}
                      <Typography variant="small" className="text-muted-foreground">
                        {serviceDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </Typography>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      isCompleted
                        ? 'bg-green-600 text-white dark:bg-green-500'
                        : 'bg-yellow-600 text-white dark:bg-yellow-500'
                    }`}
                  >
                    {isCompleted ? t('done') : t('inProgress')}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {selectedService && (
        <CompleteServiceModal
          machineId={machineId}
          blueprintSections={blueprintSections}
          serviceId={selectedService.id}
          serviceType={selectedService.type}
          initialDate={selectedService.date}
          initialPerformedBy={selectedService.performedBy}
          open={isCompleteModalOpen}
          onOpenChange={setIsCompleteModalOpen}
        />
      )}
    </>
  );
}
