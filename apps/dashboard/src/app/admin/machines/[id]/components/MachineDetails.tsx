'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { ArrowLeft, ClipboardCheck, Box } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { SectionCard, type SectionStatus } from './SectionCard';
import { Typography } from '@/components/ui/typography';
import { Machine, MachineDetailsProps } from '@/data/types/machines.types';

const SECTION_I18N_KEYS: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  SLIDE: 'slide',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance',
};

const SECTION_IMAGES: Record<string, string> = {
  BEARING_CLEARANCE: '/assets/sections/bearing-clearance.svg',
  SLIDE: '/assets/sections/slide.svg',
  GIBS: '/assets/sections/gibs.svg',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER:
    '/assets/sections/lubrication-hydraulics.svg',
  CLUTCH: '/assets/sections/clutch.svg',
  COUNTERBALANCE_CYLINDER_AIRBAG: '/assets/sections/counterbalance.svg',
};

const CLEARANCE_LIMITS = {
  WARNING: 0.15,
  ALERT: 0.2,
};

const getSectionStatus = (section: string, machine: Machine): SectionStatus => {
  if (!machine.inspections || machine.inspections.length === 0) {
    return 'unknown';
  }

  const latestInspection = machine.inspections[0];

  switch (section) {
    case 'BEARING_CLEARANCE': {
      const bearingCheck = latestInspection.bearingClearanceChecks;
      if (!bearingCheck || !bearingCheck.after) {
        return 'unknown';
      }

      const clearances = [
        bearingCheck.after.totalClearance_RH,
        bearingCheck.after.totalClearance_LH,
        bearingCheck.after.mainBearings_RH,
        bearingCheck.after.mainBearings_LH,
        bearingCheck.after.upperConnectionBearings_RH,
        bearingCheck.after.upperConnectionBearings_LH,
        bearingCheck.after.wristPinToMatingPart_RH,
        bearingCheck.after.wristPinToMatingPart_LH,
        bearingCheck.after.wristPinToBushing_RH,
        bearingCheck.after.wristPinToBushing_LH,
      ];

      const maxClearance = Math.max(...clearances);

      if (maxClearance >= CLEARANCE_LIMITS.ALERT) {
        return 'alert';
      } else if (maxClearance >= CLEARANCE_LIMITS.WARNING) {
        return 'warning';
      } else {
        return 'ok';
      }
    }

    case 'SLIDE':
    case 'GIBS':
    case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER':
    case 'CLUTCH':
    case 'COUNTERBALANCE_CYLINDER_AIRBAG':
    default:
      return 'ok';
  }
};

export function MachineDetails({ machine }: MachineDetailsProps) {
  const t = useTranslations('machines');
  const router = useInternalRouter();
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  const handleSectionClick = async (section: string) => {
    setLoadingSection(section);
    const sectionSlug = section.toLowerCase();
    router.push(`/admin/machines/${machine.id}/sections/${sectionSlug}`);
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
                    title={t(`sectionNames.${SECTION_I18N_KEYS[section] || 'unknown'}`)}
                    status={getSectionStatus(section, machine)}
                    imageUrl={SECTION_IMAGES[section]}
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
    </>
  );
}
