import { getMachineById } from '@/data/services/machines.api';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BearingClearanceSection } from './components/BearingClearanceSection';
import { Typography } from '@/components/ui/typography';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SectionDetailPageProps {
  params: Promise<{
    id: string;
    sectionSlug: string;
  }>;
}

export default async function SectionDetailPage({ params }: SectionDetailPageProps) {
  const { id, sectionSlug } = await params;
  const t = await getTranslations('machines.sectionDetails');
  const response = await getMachineById(id);

  if (response.errors || !response.data) {
    notFound();
  }

  const machine = response.data;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/machines/${id}`} className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </Link>
        <div>
          <Typography variant="muted">{machine.name}</Typography>
          <Typography variant="h2" className="capitalize border-b-0">
            {sectionSlug.replace(/_/g, ' ')}
          </Typography>
        </div>
      </div>

      {sectionSlug === 'bearing_clearance' && <BearingClearanceSection machineId={id} />}

      {sectionSlug !== 'bearing_clearance' && (
        <div className="text-center py-12">
          <Typography variant="muted">{t('comingSoon', { section: sectionSlug })}</Typography>
        </div>
      )}
    </div>
  );
}
