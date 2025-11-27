'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ServiceSummaryModal } from '@/app/admin/machines/[id]/components/ServiceSummaryModal';
import { ServiceType, ServiceStatus, type Service } from '@/data/types/services.types';

interface ServiceHistoryClientProps {
  services: Service[];
}

export function ServiceHistoryClient({ services }: ServiceHistoryClientProps) {
  const t = useTranslations('machines');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('serviceHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="muted" className="text-center py-8">
            {t('noInspectionsFound')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('serviceHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const serviceDate = new Date(service.date);
              const isCompleted = service.status === ServiceStatus.COMPLETED;

              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="flex items-start justify-between border-b pb-4 last:border-b-0 last:pb-0 hover:bg-muted/50 transition-colors p-2 -m-2 rounded-lg cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <Typography variant="h4">
                        {service.type === ServiceType.MAINTENANCE
                          ? t('maintenanceInspection')
                          : t('routineInspection')}
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
                  <Button
                    variant="default"
                    size="sm"
                    className={`${
                      isCompleted
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500'
                        : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500'
                    } text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceClick(service);
                    }}
                  >
                    {isCompleted ? t('completed') : t('inProgress')}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedService && (
        <ServiceSummaryModal
          service={selectedService}
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          hideExcelExport={true}
        />
      )}
    </>
  );
}
