'use client';

import { useState, useMemo } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { BlueprintCard } from './BlueprintCard';
import { BlueprintCreationModal } from './BlueprintCreationModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteBlueprint, type Blueprint } from '@/data/services/blueprints.api';

interface BlueprintsPageClientProps {
  blueprints: (Blueprint & {
    _count?: {
      machines: number;
    };
  })[];
}

interface DeleteState {
  blueprint: Blueprint | null;
  isOpen: boolean;
  isDeleting: boolean;
  hasMachines: boolean;
  machines: { id: string; name: string }[];
}

export function BlueprintsPageClient({ blueprints }: BlueprintsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    blueprint: null,
    isOpen: false,
    isDeleting: false,
    hasMachines: false,
    machines: [],
  });
  const router = useInternalRouter();
  const t = useTranslations('models');
  const tSections = useTranslations('sections');
  const tActions = useTranslations('actions');

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

  const handleDeleteClick = (blueprint: Blueprint) => {
    setDeleteState({
      blueprint,
      isOpen: true,
      isDeleting: false,
      hasMachines: false,
      machines: [],
    });
  };

  const handleDeleteConfirm = async (cascade: boolean = false) => {
    if (!deleteState.blueprint) return;

    setDeleteState((prev) => ({ ...prev, isDeleting: true }));

    const result = await deleteBlueprint(deleteState.blueprint.id, cascade);

    if (result.errors) {
      // Check if error contains machine data (structured error from backend)
      // NestJS BadRequestException can structure data in different ways depending on version
      const rawError = result.rawErrors as Record<string, unknown> | null;
      let machines: { id: string; name: string }[] | null = null;

      if (rawError) {
        // Structure 1: machines at root level (NestJS spreads the thrown object)
        if (Array.isArray(rawError.machines)) {
          machines = rawError.machines as { id: string; name: string }[];
        }
        // Structure 2: nested under message (NestJS wraps the object)
        else if (rawError.message && typeof rawError.message === 'object') {
          const messageObj = rawError.message as Record<string, unknown>;
          if (Array.isArray(messageObj.machines)) {
            machines = messageObj.machines as { id: string; name: string }[];
          }
        }
      }

      if (machines && machines.length > 0) {
        setDeleteState((prev) => ({
          ...prev,
          isDeleting: false,
          hasMachines: true,
          machines,
        }));
      } else {
        toast.error(t('deleteError'), {
          description: result.errors[0],
        });
        setDeleteState((prev) => ({ ...prev, isDeleting: false }));
      }
    } else {
      toast.success(t('deleteSuccess'), {
        description: cascade
          ? t('deleteSuccessWithMachines', { name: deleteState.blueprint.name })
          : t('deleteSuccessDescription', { name: deleteState.blueprint.name }),
      });
      setDeleteState({
        blueprint: null,
        isOpen: false,
        isDeleting: false,
        hasMachines: false,
        machines: [],
      });
      router.refresh();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteState({
      blueprint: null,
      isOpen: false,
      isDeleting: false,
      hasMachines: false,
      machines: [],
    });
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
                onDelete={() => handleDeleteClick(blueprint)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteState.isOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteState.hasMachines ? t('deleteWithMachinesTitle') : t('deleteConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {deleteState.hasMachines ? (
                  <>
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-md">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">
                        {t('deleteWithMachinesWarning', {
                          name: deleteState.blueprint?.name ?? '',
                          count: deleteState.machines.length,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">{t('machinesList')}:</p>
                      <div className="h-[150px] overflow-y-auto rounded-md border p-2">
                        <ul className="space-y-1">
                          {deleteState.machines.map((machine) => (
                            <li key={machine.id} className="text-sm text-muted-foreground">
                              {machine.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('deleteWithMachinesConfirm')}
                    </p>
                  </>
                ) : (
                  <p>
                    {t('deleteConfirmDescription', { name: deleteState.blueprint?.name ?? '' })}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteState.isDeleting}>
              {tActions('cancel')}
            </AlertDialogCancel>
            <Button
              onClick={() => handleDeleteConfirm(deleteState.hasMachines)}
              disabled={deleteState.isDeleting}
              variant="destructive"
            >
              {deleteState.isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tActions('deleting')}
                </>
              ) : deleteState.hasMachines ? (
                t('deleteWithMachinesButton')
              ) : (
                tActions('delete')
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
