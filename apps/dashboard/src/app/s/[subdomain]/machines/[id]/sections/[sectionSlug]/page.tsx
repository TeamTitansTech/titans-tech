import { getTranslations } from 'next-intl/server';
import { BearingClearanceSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/BearingClearanceSectionWrapper';
import { BearingClearanceSingleHammerSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/BearingClearanceSingleHammerSectionWrapper';
import { ClutchSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/ClutchSectionWrapper';
import { ClutchCevolaniSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/ClutchCevolaniSectionWrapper';
import { SlideSingleHammerSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/SlideSingleHammerSectionWrapper';
import { SlideDoubleHammerSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/SlideDoubleHammerSectionWrapper';
import { GibsSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/GibsSectionWrapper';
import { LubricationSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/LubricationSectionWrapper';
import { CounterbalanceSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/CounterbalanceSectionWrapper';
import { PistonsSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/PistonsSectionWrapper';
import { TrammingSectionWrapper } from '@/app/admin/machines/[id]/sections/[sectionSlug]/components/TrammingSectionWrapper';
import { Typography } from '@/components/ui/typography';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SectionDetailPageProps {
  params: Promise<{
    subdomain: string;
    id: string;
    sectionSlug: string;
  }>;
}

export default async function SectionDetailPage({ params }: SectionDetailPageProps) {
  const { id, sectionSlug } = await params;
  const t = await getTranslations('machines.sectionDetails');

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href={`/machines/${id}`} className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </Link>
        <div className="min-w-0 flex-1">
          <Typography
            variant="h2"
            className="capitalize border-b-0 text-xl sm:text-2xl lg:text-3xl truncate"
          >
            {sectionSlug.replace(/_/g, ' ')}
          </Typography>
        </div>
      </div>

      {sectionSlug === 'bearing_clearance' && <BearingClearanceSectionWrapper machineId={id} />}
      {sectionSlug === 'bearing_clearance_single_hammer' && (
        <BearingClearanceSingleHammerSectionWrapper machineId={id} />
      )}
      {sectionSlug === 'clutch' && <ClutchSectionWrapper machineId={id} />}
      {sectionSlug === 'clutch_cevolani' && <ClutchCevolaniSectionWrapper machineId={id} />}
      {sectionSlug === 'slide_single_hammer' && <SlideSingleHammerSectionWrapper machineId={id} />}
      {sectionSlug === 'slide_double_hammer' && <SlideDoubleHammerSectionWrapper machineId={id} />}
      {sectionSlug === 'gibs' && <GibsSectionWrapper machineId={id} />}
      {sectionSlug === 'lubrication_hydraulics_pressure_switches_oil_filter' && (
        <LubricationSectionWrapper machineId={id} />
      )}
      {sectionSlug === 'counterbalance_cylinder_airbag' && (
        <CounterbalanceSectionWrapper machineId={id} />
      )}
      {sectionSlug === 'pistons' && <PistonsSectionWrapper machineId={id} />}
      {sectionSlug === 'tramming' && <TrammingSectionWrapper machineId={id} />}

      {sectionSlug !== 'bearing_clearance' &&
        sectionSlug !== 'bearing_clearance_single_hammer' &&
        sectionSlug !== 'clutch' &&
        sectionSlug !== 'clutch_cevolani' &&
        sectionSlug !== 'slide_single_hammer' &&
        sectionSlug !== 'slide_double_hammer' &&
        sectionSlug !== 'gibs' &&
        sectionSlug !== 'lubrication_hydraulics_pressure_switches_oil_filter' &&
        sectionSlug !== 'counterbalance_cylinder_airbag' &&
        sectionSlug !== 'pistons' &&
        sectionSlug !== 'tramming' && (
          <div className="text-center py-12">
            <Typography variant="muted">{t('comingSoon', { section: sectionSlug })}</Typography>
          </div>
        )}
    </div>
  );
}
