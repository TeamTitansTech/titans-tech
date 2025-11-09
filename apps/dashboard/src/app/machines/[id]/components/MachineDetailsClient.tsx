'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Plus, Download,
  Wrench,
  Calendar,
  ClipboardCheck
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
      <div>
        <Link href="/machines" className="w-full flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{machine.name}</h1>
              <p className="text-muted-foreground mt-1">
                {machine.blueprint?.name || t('noBlueprintAssigned')}
              </p>
            </div>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium text-center items-center justify-center flex">
              {t('operational')}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-2">
          <CardHeader>
            <CardTitle>{t('machineSpecifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {machine.fields.map((field) => (
                <div key={field.fieldSlug} className="space-y-1">
                  <p className="text-sm text-muted-foreground">{getFieldName(field.fieldSlug)}</p>
                  <p className="text-2xl font-bold">{field.value}</p>
                </div>
              ))}
            </div>

            {machine.fields.length === 0 && (
              <p className="text-muted-foreground text-center py-8">{t('noFieldsConfigured')}</p>
            )}

            <Separator className="my-6" />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                <span className="font-medium">{t('lastInspection')}:</span> {lastInspectionText}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{t('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              size="lg"
              onClick={() => setIsInspectionModalOpen(true)}
            >
              <ClipboardCheck className="w-5 h-5 mr-2" />
              {t('createInspection')}
            </Button>
            <Button className="w-full justify-start" size="lg" disabled>
              <Plus className="w-5 h-5 mr-2" />
              {t('createServiceRequest')}
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" disabled>
              <Wrench className="w-5 h-5 mr-2" />
              {t('viewMaintenanceLog')}
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" disabled>
              <Download className="w-5 h-5 mr-2" />
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
