'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Wrench, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ServiceCreationModal from './ServiceCreationModal';
import { ServiceSummaryModal } from './ServiceSummaryModal';
import type { Service } from '@/data/types/services.types';

interface ServiceHistoryClientProps {
  machineId: string;
  blueprintSections: string[];
  services: Service[];
}

export function ServiceHistoryClient({
  machineId,
  blueprintSections,
  services,
}: ServiceHistoryClientProps) {
  const t = useTranslations('machines');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  if (services.length === 0) {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{t('serviceHistory')}</CardTitle>
            <Button size="sm" onClick={() => setIsServiceModalOpen(true)} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              {t('newService')}
            </Button>
          </CardHeader>
          <CardContent>
            <Typography variant="muted" className="text-center py-8">
              {t('noServicesFound')}
            </Typography>
          </CardContent>
        </Card>
        <ServiceCreationModal
          machineId={machineId}
          blueprintSections={blueprintSections}
          open={isServiceModalOpen}
          onOpenChange={setIsServiceModalOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{t('serviceHistory')}</CardTitle>
          <Button size="sm" onClick={() => setIsServiceModalOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            {t('newService')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const serviceDate = new Date(service.date);
              // All services are completed once created
              const isCompleted = true;

              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0 cursor-pointer hover:bg-muted transition-colors rounded-lg p-2 -m-2"
                >
                  <div className="flex items-start gap-3">
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
                        : 'bg-blue-600 text-white dark:bg-blue-500'
                    }`}
                  >
                    {isCompleted ? t('completed') : t('inProgress')}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <ServiceCreationModal
        machineId={machineId}
        blueprintSections={blueprintSections}
        open={isServiceModalOpen}
        onOpenChange={setIsServiceModalOpen}
      />
      {selectedService && (
        <ServiceSummaryModal
          service={selectedService}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        />
      )}
    </>
  );
}
