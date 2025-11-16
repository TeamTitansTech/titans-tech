'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import SimpleServiceCreationModal from './SimpleServiceCreationModal';
import { ServiceCompletionModal } from './ServiceCompletionModal';
import { deleteService } from '@/data/services/services.api';
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
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation(); // Prevent triggering the service click
    setServiceToDelete(service);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteService(serviceToDelete.id, machineId);

      if (response.errors) {
        toast.error('Failed to delete service');
      } else {
        toast.success('Service deleted successfully');
        setServiceToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
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
                // Check if service has any sections completed (in progress)
                const serviceData = service as any;
                const completedSections = Array.isArray(serviceData.completedSections)
                  ? serviceData.completedSections
                  : [];
                const hasStarted = completedSections.length > 0;

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
                    <div className="flex items-center gap-2">
                      {hasStarted && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-600 text-white dark:bg-yellow-500">
                          {t('inProgress')}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteClick(e, service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
      <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteServiceTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteServiceDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
