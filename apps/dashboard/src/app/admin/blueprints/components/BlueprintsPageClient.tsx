'use client';

import { useState } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { BlueprintCard } from './BlueprintCard';
import { BlueprintCreationModal } from './BlueprintCreationModal';
import { BlueprintEditModal } from './BlueprintEditModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { deleteBlueprint } from '@/data/services/blueprints.api';
import { toast } from 'sonner';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [blueprintToEdit, setBlueprintToEdit] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blueprintToDelete, setBlueprintToDelete] = useState<string | null>(null);
  const router = useInternalRouter();
  const t = useTranslations('models');

  const handleSuccess = () => {
    router.refresh();
  };

  const handleEditClick = (id: string) => {
    setBlueprintToEdit(id);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setBlueprintToEdit(null);
  };

  const handleDeleteClick = (id: string) => {
    setBlueprintToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blueprintToDelete) return;

    const response = await deleteBlueprint(blueprintToDelete);

    if (response.errors) {
      toast.error(t('deleteError'));
    } else {
      toast.success(t('deleteSuccess'));
      router.refresh();
    }

    setDeleteDialogOpen(false);
    setBlueprintToDelete(null);
  };

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
                description={blueprint.sections.join(', ') || t('noDescription')}
                machineCount={blueprint._count?.machines || 0}
                fieldCount={blueprint.fields.length}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
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

      <BlueprintEditModal
        isOpen={isEditModalOpen}
        blueprintId={blueprintToEdit}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t('deleteConfirm.title')}
        description={t('deleteConfirm.description')}
        confirmText={t('deleteConfirm.confirm')}
        cancelText={t('deleteConfirm.cancel')}
      />
    </>
  );
}
