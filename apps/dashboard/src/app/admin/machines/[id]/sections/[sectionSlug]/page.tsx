import { getTranslations } from 'next-intl/server';
import { BearingClearanceSectionWrapper } from './components/BearingClearanceSectionWrapper';
import { ClutchSectionWrapper } from './components/ClutchSectionWrapper';
import { SlideSingleHammerSectionWrapper } from './components/SlideSingleHammerSectionWrapper';
import { SlideDoubleHammerSectionWrapper } from './components/SlideDoubleHammerSectionWrapper';
import { GibsSectionWrapper } from './components/GibsSectionWrapper';
import { LubricationSectionWrapper } from './components/LubricationSectionWrapper';
import { CounterbalanceSectionWrapper } from './components/CounterbalanceSectionWrapper';
import { PistonsSectionWrapper } from './components/PistonsSectionWrapper';
import { TrammingSectionWrapper } from './components/TrammingSectionWrapper';
import { Typography } from '@/components/ui/typography';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SectionDetailPageProps {
  params: Promise<{
    id: string;
    sectionSlug: string;
  }>;
}

const sectionComponents: Record<string, React.ComponentType<{ machineId: string }>> = {
  bearing_clearance: BearingClearanceSectionWrapper,
  clutch: ClutchSectionWrapper,
  slide_single_hammer: SlideSingleHammerSectionWrapper,
  slide_double_hammer: SlideDoubleHammerSectionWrapper,
  gibs: GibsSectionWrapper,
  lubrication_hydraulics_pressure_switches_oil_filter: LubricationSectionWrapper,
  counterbalance_cylinder_airbag: CounterbalanceSectionWrapper,
  pistons: PistonsSectionWrapper,
  tramming: TrammingSectionWrapper,
};

export default async function SectionDetailPage({ params }: SectionDetailPageProps) {
  const { id, sectionSlug } = await params;
  const t = await getTranslations('machines.sectionDetails');

  const SectionComponent = sectionComponents[sectionSlug];

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Always use /admin prefix since this is the admin section page */}
        <Link href={`/admin/machines/${id}`} className="shrink-0">
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

      {SectionComponent ? (
        <SectionComponent machineId={id} />
      ) : (
        <div className="text-center py-12">
          <Typography variant="muted">{t('comingSoon', { section: sectionSlug })}</Typography>
        </div>
      )}
    </div>
  );
}
