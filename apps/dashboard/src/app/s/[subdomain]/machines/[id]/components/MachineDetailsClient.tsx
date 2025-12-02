'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { ArrowLeft, Wrench, ClipboardCheck, Box, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ServiceCompletionModal } from './ServiceCompletionModal';
import { UrgentServiceModal } from './UrgentServiceModal';
import { LatestReportModal } from '@/app/admin/machines/[id]/components/LatestReportModal';
import { Typography } from '@/components/ui/typography';
import type { Machine } from '@titans-tech/shared/types';
import type { LatestReport } from '@/data/types/services.types';
import { SectionCard } from '@/components/shared/SectionCard';
import { getLatestReport } from '@/data/services/services.api';

export interface MachineDetailsClientProps {
  machine: Machine;
}

export function MachineDetailsClient({ machine }: MachineDetailsClientProps) {
  const t = useTranslations('machines');
  const router = useInternalRouter();
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isUrgentServiceModalOpen, setIsUrgentServiceModalOpen] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleSectionClick = (section: string) => {
    setLoadingSection(section);
    const sectionSlug = section.toLowerCase();
    router.push(`/machines/${machine.id}/sections/${sectionSlug}`);
  };

  const handleOpenReport = async () => {
    setIsLoadingReport(true);
    try {
      const response = await getLatestReport(machine.id);
      if (response.data) {
        setLatestReport(response.data);
        setIsReportModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching latest report:', error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link href="/machines" className="shrink-0 mt-1">
            <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
          </Link>
          <div className="min-w-0">
            <ConditionalTooltip content={machine.name} className="block">
              <Typography variant="h2" className="break-words">
                {machine.name}
              </Typography>
            </ConditionalTooltip>
            <ConditionalTooltip
              content={machine.blueprint?.name || t('noBlueprintAssigned')}
              className="mt-1 block"
            >
              <Typography variant="muted" className="break-words">
                {machine.blueprint?.name || t('noBlueprintAssigned')}
              </Typography>
            </ConditionalTooltip>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button onClick={handleOpenReport} disabled={isLoadingReport} size="sm">
            <FileText className="w-4 h-4 mr-2" />
            {isLoadingReport ? 'Carregando...' : 'Ver Relatório'}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsUrgentServiceModalOpen(true)}>
            <Wrench className="w-4 h-4 mr-2" />
            {t('requestUrgentService')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[350px_1fr] gap-6">
        <Card className="bg-muted h-full">
          <CardContent className="p-0 h-full">
            <div className="relative aspect-[16/9] md:aspect-auto md:h-full md:min-h-[300px] bg-muted flex items-center justify-center">
              {machine.imageUrl ? (
                <Image
                  src={machine.imageUrl}
                  alt={machine.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 280px, 350px"
                />
              ) : (
                <div className="text-center p-6">
                  <Box className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
                  <Typography variant="muted">{t('noImageAvailable')}</Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {machine.blueprint?.sections && machine.blueprint.sections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {machine.blueprint.sections.map((section) => (
                  <SectionCard
                    key={section}
                    sectionKey={section}
                    machine={machine}
                    onClick={() => handleSectionClick(section)}
                    isLoading={loadingSection === section}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <Typography variant="p">{t('noSectionsAvailable')}</Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ServiceCompletionModal
        machineId={machine.id}
        open={isInspectionModalOpen}
        onOpenChange={setIsInspectionModalOpen}
        machineSections={machine.blueprint?.sections}
      />

      <UrgentServiceModal
        machineId={machine.id}
        machineName={machine.name}
        open={isUrgentServiceModalOpen}
        onOpenChange={setIsUrgentServiceModalOpen}
      />

      {latestReport && (
        <LatestReportModal
          report={latestReport}
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
        />
      )}
    </>
  );
}
