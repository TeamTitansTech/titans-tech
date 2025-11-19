'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { ArrowLeft, Wrench, ClipboardCheck, Box } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { ServiceCompletionModal } from './ServiceCompletionModal';
import { SectionCard } from '@/components/shared/SectionCard';
import { Typography } from '@/components/ui/typography';
import type { Machine } from '@titans-tech/shared/types';

interface MachineDetailsClientProps {
  machine: Machine;
}

export function MachineDetailsClient({ machine }: MachineDetailsClientProps) {
  const t = useTranslations('machines');
  const router = useInternalRouter();
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  const handleSectionClick = (section: string) => {
    setLoadingSection(section);
    const sectionSlug = section.toLowerCase();
    router.push(`/machines/${machine.id}/sections/${sectionSlug}`);
  };

  return (
    <>
      <div className="flex items-center gap-6 mb-6">
        <Link href="/machines" className="shrink-0">
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
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => setIsInspectionModalOpen(true)}
          >
            <Wrench className="w-4 h-4 mr-2" />
            {t('requestUrgentService')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <Card>
          <CardContent className="p-0">
            <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
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

      <ServiceCompletionModal
        machineId={machine.id}
        open={isInspectionModalOpen}
        onOpenChange={setIsInspectionModalOpen}
        machineSections={machine.blueprint?.sections}
      />
    </>
  );
}
