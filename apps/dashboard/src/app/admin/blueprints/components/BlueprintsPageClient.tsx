'use client';

import { useState } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { BlueprintCard } from './BlueprintCard';
import { BlueprintCreationModal } from './BlueprintCreationModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Typography } from '@/components/ui/typography';

interface Blueprint {
  id: string;
  name: string;
  imageUrl?: string;
  sections: string[];
  fields: { fieldName: string }[];
  _count?: {
    machines: number;
  };
}

interface BlueprintsPageClientProps {
  blueprints: Blueprint[];
}

export function BlueprintsPageClient({ blueprints }: BlueprintsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useInternalRouter();
  const t = useTranslations('models');

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1" className="text-3xl font-bold tracking-tight">
              {t('pageTitle')}
            </Typography>
            <Typography variant="muted">{t('pageDescription')}</Typography>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newButton')}
          </Button>
        </div>

        {blueprints.length === 0 ? (
          <div className="text-center py-12">
            <Typography variant="muted">{t('emptyState')}</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((blueprint) => (
              <BlueprintCard
                key={blueprint.id}
                id={blueprint.id}
                name={blueprint.name}
                imageUrl={blueprint.imageUrl}
                description={blueprint.sections.join(', ') || t('noDescription')}
                machineCount={blueprint._count?.machines || 0}
                fieldCount={blueprint.fields.length}
              />
            ))}
          </div>
        )}
      </div>

      <BlueprintCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
