'use client';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MachineInspection, MachineService } from '@titans-tech/shared/types';
import type { LatestReport } from '@/data/types/services.types';
import { getSectionStatus, getSectionStatusFromReport } from '@/lib/alertStatus';

interface SectionCardProps {
  sectionKey: string;
  machine: {
    inspections?: MachineInspection[];
    services?: MachineService[];
  };
  latestReport?: LatestReport | null;
  onClick?: () => void;
  isLoading?: boolean;
}

const STATUS_COLORS = {
  ok: 'bg-green-500',
  warning: 'bg-yellow-500',
  alert: 'bg-red-500',
} as const;

const SECTION_I18N_KEYS: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  SLIDE_SINGLE_HAMMER: 'slideSingleHammer',
  SLIDE_DOUBLE_HAMMER: 'slideDoubleHammer',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance',
  TRAMMING: 'tramming',
  PISTONS: 'pistons',
  SHIM_THICKNESS: 'shimThickness',
  DIE_CUSHION: 'dieCushion',
  ELECTRICAL_CONTROL: 'electricalControl',
  PERPENDICULARITY: 'perpendicularity',
};

const SECTION_IMAGES: Record<string, string> = {
  BEARING_CLEARANCE: '/assets/sections/bearing-clearance.svg',
  SLIDE_SINGLE_HAMMER: '/assets/sections/slide.svg',
  SLIDE_DOUBLE_HAMMER: '/assets/sections/slide.svg',
  GIBS: '/assets/sections/gibs.svg',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER:
    '/assets/sections/lubrication-hydraulics.svg',
  CLUTCH: '/assets/sections/clutch.svg',
  COUNTERBALANCE_CYLINDER_AIRBAG: '/assets/sections/counterbalance.svg',
  TRAMMING: '/assets/sections/tramming.svg',
  PISTONS: '/assets/sections/pistons.svg',
  SHIM_THICKNESS: '/assets/sections/shim-thickness.svg',
  DIE_CUSHION: '/assets/sections/die-cushion.svg',
  ELECTRICAL_CONTROL: '/assets/sections/electrical-control.svg',
  PERPENDICULARITY: '/assets/sections/perpendicularity.svg',
};

export function SectionCard({
  sectionKey,
  machine,
  latestReport,
  onClick,
  isLoading = false,
}: SectionCardProps) {
  const t = useTranslations('machines');

  // Use latestReport for status if available (preferred), otherwise fall back to deprecated machine.services
  const status = latestReport
    ? getSectionStatusFromReport(sectionKey, latestReport)
    : getSectionStatus(sectionKey, machine);
  const imageUrl = SECTION_IMAGES[sectionKey];
  const title = t(`sectionNames.${SECTION_I18N_KEYS[sectionKey] || 'unknown'}`);

  // Use API route for images when on a subdomain
  const getImageUrl = (path: string) => {
    if (typeof window === 'undefined') return path;

    const hostname = window.location.hostname;
    // If we're on a subdomain, use the API route
    if (hostname.includes('.localhost')) {
      // Remove the leading /assets/ from the path
      const assetPath = path.replace('/assets/', '');
      return `/api/assets/${assetPath}`;
    }
    // Otherwise use the direct path
    return path;
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]',
        'bg-card border-border',
        onClick && !isLoading && 'cursor-pointer',
        isLoading && 'opacity-75 cursor-wait',
      )}
      onClick={isLoading ? undefined : onClick}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      <div className="absolute top-3 right-3 z-10">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 border-white shadow-md',
            STATUS_COLORS[status],
          )}
        />
      </div>

      <div className="aspect-[2/1] bg-slate-400 dark:bg-slate-600 flex items-center justify-center relative px-3">
        {imageUrl ? (
          <Image
            src={getImageUrl(imageUrl)}
            alt={title}
            width={150}
            height={150}
            className="object-contain max-w-full max-h-full brightness-0 invert"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-xs">No Image</span>
          </div>
        )}
      </div>

      <div className="p-3 bg-secondary">
        <Typography variant="h4" className="text-sm font-medium text-secondary-foreground truncate">
          {title}
        </Typography>
      </div>
    </Card>
  );
}
