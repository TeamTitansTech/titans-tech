'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { ArrowLeft, ClipboardCheck, Box, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { SectionCard } from '@/components/shared/SectionCard';
import { Typography } from '@/components/ui/typography';
import type { MachineDetailsProps } from '@/data/types/machines.types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LatestReportModal } from './LatestReportModal';
import { getLatestReport } from '@/data/services/services.api';
import type { LatestReport } from '@/data/types/services.types';
import { QRCodeGenerator } from '@/components/machines/QRCodeGenerator';

export function MachineDetails({ machine }: MachineDetailsProps) {
  const t = useTranslations('machines');
  const router = useInternalRouter();
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [latestReport, setLatestReport] = useState<LatestReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const handleSectionClick = async (section: string) => {
    setLoadingSection(section);
    const sectionSlug = section.toLowerCase();
    router.push(`/admin/machines/${machine.id}/sections/${sectionSlug}`);
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
      <div className="flex items-center gap-6 mb-6">
        <Link href={'/admin/machines'} className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </Link>
        <div className="flex items-center justify-between w-full min-w-0 gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <ConditionalTooltip content={machine.name} className="block">
              <Typography variant="h2">{machine.name}</Typography>
            </ConditionalTooltip>
            <ConditionalTooltip
              content={machine.blueprint?.name || t('noBlueprintAssigned')}
              className="mt-1 truncate block"
            >
              <Typography variant="muted">
                {machine.blueprint?.name || t('noBlueprintAssigned')}
              </Typography>
            </ConditionalTooltip>
          </div>
          <div className="flex gap-2 shrink-0">
            <QRCodeGenerator
              machineId={machine.id}
              machineName={machine.name}
              machineSerialNumber={machine.serialNumber}
              variant="outline"
            />
            <Button onClick={handleOpenReport} disabled={isLoadingReport} className="gap-2">
              <FileText className="w-4 h-4" />
              {isLoadingReport ? 'Carregando...' : 'Ver Relatório Atualizado'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <Card className="bg-muted">
          <CardContent className="p-0">
            <div className="relative aspect-[3/4] bg-muted flex items-center justify-center">
              {machine.imageUrl ? (
                <Image
                  src={machine.imageUrl}
                  alt={machine.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
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
