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
    // useInternalRouter auto-adds /admin prefix, so don't include it here
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
      <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
        <Link href={'/admin/machines'} className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </Link>
        <div className="flex items-center justify-between w-full min-w-0 gap-2 sm:gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <ConditionalTooltip content={machine.name} className="block">
              <Typography variant="h2" className="text-lg sm:text-2xl">
                {machine.name}
              </Typography>
            </ConditionalTooltip>
            <ConditionalTooltip
              content={machine.blueprint?.name || t('noBlueprintAssigned')}
              className="mt-1 truncate block"
            >
              <Typography variant="muted" className="text-xs sm:text-sm">
                {machine.blueprint?.name || t('noBlueprintAssigned')}
              </Typography>
            </ConditionalTooltip>
          </div>
          <Button
            onClick={handleOpenReport}
            disabled={isLoadingReport}
            className="gap-1 sm:gap-2 shrink-0 text-xs sm:text-sm px-2 sm:px-4"
            size="sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isLoadingReport ? 'Carregando...' : 'Ver Relatório'}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
        <Card className="bg-muted">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] md:aspect-[3/4] bg-muted flex items-center justify-center">
              {machine.imageUrl ? (
                <Image
                  src={machine.imageUrl}
                  alt={machine.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 200px, 280px"
                />
              ) : (
                <div className="text-center p-3 md:p-4">
                  <Box className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-1 md:mb-2" />
                  <Typography variant="muted" className="text-xs md:text-sm">
                    {t('noImageAvailable')}
                  </Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardContent className="p-2 sm:p-3 lg:pt-6 lg:px-6">
            {machine.blueprint?.sections && machine.blueprint.sections.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-3">
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
