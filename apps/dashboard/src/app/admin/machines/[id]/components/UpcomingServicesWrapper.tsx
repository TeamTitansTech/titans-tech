'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Calendar, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SimpleServiceCreationModal from './SimpleServiceCreationModal';
import { ServiceCompletionModal } from './ServiceCompletionModal';
import type { Service } from '@/data/types/services.types';

interface UpcomingServicesWrapperProps {
  machineId: string;
  blueprintSections: string[];
  services: Service[];
}

export function UpcomingServicesWrapper({
  machineId,
  blueprintSections,
  services,
}: UpcomingServicesWrapperProps) {
  const t = useTranslations('machines');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Filter for upcoming services (future dates and PENDING status)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingServices = services.filter((service) => {
    const serviceDate = new Date(service.date);
    serviceDate.setHours(0, 0, 0, 0);
    return serviceDate >= today && service.status === 'PENDING';
  });

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);

    // If it's a maintenance service, open the section selection modal
    // If it's an inspection, open the complete service modal
    if (service.type === 'MAINTENANCE') {
      setIsMaintenanceModalOpen(true);
    } else {
      setIsCompleteModalOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('upcomingServices')}</CardTitle>
          <Button size="sm" onClick={() => setIsServiceModalOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            {t('newService')}
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingServices.length === 0 ? (
            <Typography variant="muted" className="text-center py-8">
              {t('noUpcomingServices')}
            </Typography>
          ) : (
            <div className="space-y-4">
              {upcomingServices.map((service) => {
                const serviceDate = new Date(service.date);

                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-4 cursor-pointer hover:bg-muted transition-colors rounded-lg p-2 "
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <Typography variant="h4">
                          {service.type === 'MAINTENANCE'
                            ? t('scheduledMaintenance')
                            : t('scheduledInspection')}
                        </Typography>
                        <Typography variant="small" className="text-muted-foreground">
                          {serviceDate.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </Typography>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <SimpleServiceCreationModal
        machineId={machineId}
        open={isServiceModalOpen}
        onOpenChange={setIsServiceModalOpen}
      />
      {selectedService && selectedService.type === 'MAINTENANCE' && (
        <ServiceCompletionModal
          machineId={machineId}
          open={isMaintenanceModalOpen}
          onOpenChange={setIsMaintenanceModalOpen}
          machineSections={blueprintSections}
          serviceId={selectedService.id}
          serviceType={selectedService.type}
          initialDate={selectedService.date}
          initialPerformedBy={selectedService.performedBy ?? undefined}
        />
      )}
      {selectedService && selectedService.type === 'INSPECTION' && (
        <ServiceCompletionModal
          machineId={machineId}
          open={isCompleteModalOpen}
          onOpenChange={setIsCompleteModalOpen}
          machineSections={blueprintSections}
          serviceId={selectedService.id}
          serviceType={selectedService.type}
          initialDate={selectedService.date}
          initialPerformedBy={selectedService.performedBy ?? undefined}
        />
      )}
    </>
  );
}
