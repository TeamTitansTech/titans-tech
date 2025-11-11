import { getTranslations } from 'next-intl/server';
import { BearingClearanceSectionWrapper } from './components/BearingClearanceSectionWrapper';
import { Typography } from '@/components/ui/typography';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isSysAdminPanel } from '@/lib/isSysAdminPanel';

interface SectionDetailPageProps {
  params: Promise<{
    id: string;
    sectionSlug: string;
  }>;
}

export default async function SectionDetailPage({ params }: SectionDetailPageProps) {
  const { id, sectionSlug } = await params;
  const isSysPanel = await isSysAdminPanel();
  const t = await getTranslations('machines.sectionDetails');

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href={`${isSysPanel ? '/admin' : ''}/machines/${id}`} className="shrink-0">
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

      {sectionSlug !== 'bearing_clearance' && (
        <div className="text-center py-12">
          <Typography variant="muted">{t('comingSoon', { section: sectionSlug })}</Typography>
        </div>
      )}
    </div>
  );
}
