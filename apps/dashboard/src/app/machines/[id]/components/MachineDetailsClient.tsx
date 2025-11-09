'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import {
  ArrowLeft,
  Plus,
  Download,
  Wrench,
  ClipboardCheck,
  Building2,
  Box,
  MapPin,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { InspectionCreationModal } from './InspectionCreationModal';

interface MachineField {
  fieldSlug: string;
  value: string | number;
}

interface BlueprintField {
  fieldName: string;
  fieldSlug: string;
  fieldType: string;
  fieldOptions?: string[];
}

interface Blueprint {
  id: string;
  name: string;
  sections: string[];
  fields: BlueprintField[];
  createdAt: string;
  updatedAt: string;
}

interface Machine {
  id: string;
  blueprintId: string;
  name: string;
  fields: MachineField[];
  createdAt: string;
  updatedAt: string;
  blueprint?: Blueprint;
  client?: string;
  location?: string;
}

interface MachineDetailsClientProps {
  machine: Machine;
}

export function MachineDetailsClient({ machine }: MachineDetailsClientProps) {
  const t = useTranslations('machines');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  // Use useState with lazy initializer to avoid calling Date.now() during render
  const [daysSinceUpdate] = useState(() =>
    Math.floor((Date.now() - new Date(machine.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
  );

  const lastInspectionText =
    daysSinceUpdate === 0
      ? t('today')
      : daysSinceUpdate === 1
        ? t('yesterday')
        : t('daysAgo', { days: daysSinceUpdate });

  const getFieldName = (fieldSlug: string) => {
    const blueprintField = machine.blueprint?.fields.find((f) => f.fieldSlug === fieldSlug);
    return blueprintField?.fieldName || fieldSlug;
  };

  return (
    <>
      <div className="flex items-center gap-6">
        <Link href="/machines" className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-orange-500 transition-colors cursor-pointer" />
        </Link>
        <div className="flex items-center justify-between w-full min-w-0 gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <ConditionalTooltip content={machine.name} className="block">
              <h1 className="text-3xl font-bold tracking-tight truncate">{machine.name}</h1>
            </ConditionalTooltip>
            <ConditionalTooltip
              content={machine.blueprint?.name || t('noBlueprintAssigned')}
              className="text-muted-foreground mt-1 truncate block"
            >
              {machine.blueprint?.name || t('noBlueprintAssigned')}
            </ConditionalTooltip>
          </div>
          <span className="bg-green-600 text-white dark:bg-green-500 px-3 py-1 rounded-full text-xs font-medium shrink-0">
            {t('operational')}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-2/3">
          <CardHeader>
            <CardTitle>{t('machineSpecifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            {machine.fields.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {machine.fields.map((field) => (
                    <div key={field.fieldSlug} className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {getFieldName(field.fieldSlug)}
                      </p>
                      <p className="text-2xl font-bold">{field.value}</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
              </>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('client')}:</span>
                <span className="font-medium">{machine.client || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Box className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('model')}:</span>
                <span className="font-medium">{machine.blueprint?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('location')}:</span>
                <span className="font-medium">{machine.location || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('lastInspection')}:</span>
                <span className="font-medium">{lastInspectionText}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle>{t('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full " size="sm" onClick={() => setIsInspectionModalOpen(true)}>
              <ClipboardCheck className="w-4 h-4 mr-2" />
              {t('createInspection')}
            </Button>
            <Button className="w-full" size="sm" disabled>
              <Plus className="w-4 h-4 mr-2" />
              {t('createServiceRequest')}
            </Button>
            <Button variant="outline" className="w-full" size="sm" disabled>
              <Wrench className="w-4 h-4 mr-2" />
              {t('viewMaintenanceLog')}
            </Button>
            <Button variant="outline" className="w-full" size="sm" disabled>
              <Download className="w-4 h-4 mr-2" />
              {t('downloadReports')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <InspectionCreationModal
        machineId={machine.id}
        open={isInspectionModalOpen}
        onOpenChange={setIsInspectionModalOpen}
      />
    </>
  );
}
