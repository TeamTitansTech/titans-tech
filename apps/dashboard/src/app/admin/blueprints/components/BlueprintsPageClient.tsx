'use client';

import { useState, useMemo } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { BlueprintCard } from './BlueprintCard';
import { BlueprintCreationModal } from './BlueprintCreationModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import type { Blueprint } from '@/data/services/blueprints.api';

interface BlueprintsPageClientProps {
  blueprints: (Blueprint & {
    _count?: {
      machines: number;
    };
  })[];
}

export function BlueprintsPageClient({ blueprints }: BlueprintsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null);
  const router = useInternalRouter();
  const t = useTranslations('models');
  const tSections = useTranslations('sections');

  const handleSuccess = () => {
    router.refresh();
    setEditingBlueprint(null);
  };

  const handleEdit = (blueprint: Blueprint) => {
    setEditingBlueprint(blueprint);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlueprint(null);
  };

  // Helper to convert section slugs to translated names
  const getSectionNames = useMemo(() => {
    return (sections: string[]) => {
      return sections.map((section) => tSections(section.toLowerCase())).join(', ');
    };
  }, [tSections]);

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2">{t('pageTitle')}</Typography>
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
                description={getSectionNames(blueprint.sections) || t('noDescription')}
                machineCount={blueprint._count?.machines || 0}
                fieldCount={blueprint.fields.length}
                sections={blueprint.sections}
                onEdit={() => handleEdit(blueprint)}
              />
            ))}
          </div>
        )}
      </div>

      <BlueprintCreationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        blueprint={editingBlueprint || undefined}
      />
    </>
  );
}
