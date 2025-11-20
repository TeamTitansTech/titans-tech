'use client';

import { Calendar, Wrench, ClipboardCheck, MapPin, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface ServiceCardProps {
  service: {
    id: string;
    date: Date | string;
    type: 'INSPECTION' | 'MAINTENANCE';
    status: 'PENDING' | 'COMPLETED';
    performedBy?: string | null;
    currentStep?: string | null;
    machine: {
      id: string;
      name: string;
      branch: {
        id: string;
        name: string;
      };
    };
  };
  onClick?: () => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const t = useTranslations('services');
  const tMachines = useTranslations('machines');

  const isInProgress = service.status === 'PENDING' && service.currentStep;
  const isCompleted = service.status === 'COMPLETED';

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {tMachines('completed')}
        </Badge>
      );
    }
    if (isInProgress) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          {tMachines('inProgress')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t('pending')}</Badge>
    );
  };

  const getServiceTypeLabel = () => {
    return service.type === 'INSPECTION'
      ? tMachines('scheduledInspection')
      : tMachines('scheduledMaintenance');
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        onClick ? 'hover:border-orange-300' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header: Machine name and status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Package className="h-5 w-5 text-orange-600 shrink-0" />
              <h3 className="font-semibold text-base truncate">{service.machine.name}</h3>
            </div>
            {getStatusBadge()}
          </div>

          {/* Branch */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{service.machine.branch.name}</span>
          </div>

          {/* Service type and date */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              {service.type === 'INSPECTION' ? (
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Wrench className="h-4 w-4 text-orange-600" />
              )}
              <span className="text-gray-700">{getServiceTypeLabel()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{formatDate(service.date)}</span>
            </div>
          </div>

          {/* Technician if completed */}
          {isCompleted && service.performedBy && (
            <div className="text-sm text-gray-500 pt-2 border-t">
              <span className="font-medium">{tMachines('technician')}:</span> {service.performedBy}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
