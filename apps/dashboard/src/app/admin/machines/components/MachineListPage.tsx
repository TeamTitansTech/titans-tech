'use client';

import { useState, useEffect } from 'react';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { MachineCard } from './MachineCard';
import { MachineCardSkeleton } from './MachineCardSkeleton';
import { MachineCreationModal } from './MachineCreationModal';
import { MachineEditModal } from './MachineEditModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteMachine } from '@/data/services/machines.api';
import { getLatestReport } from '@/data/services/services.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { toast } from 'sonner';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types';
import { calculateStatusFromLatestReport, type AlertStatus } from '@/lib/alertStatus';
import type { LatestReport } from '@/data/types/services.types';

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  imageUrl?: string | null;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
  manufacturer?: string | null;
  model?: string | null;
  sizeTonnage?: string | null;
  serialNumber?: string | null;
  stroke?: string | null;
  foundationType?: FoundationType | null;
  frameType?: FrameType | null;
  clutchType?: MachineClutchType | null;
  pneumaticSystem?: PneumaticSystemType | null;
  pressMounting?: PressMountingType | null;
  features?: MachineFeaturesType | null;
}

interface MachineWithStatus extends Machine {
  latestReport?: LatestReport | null;
  alertStatus?: AlertStatus;
}

// Helper to map alert status to machine card status
const mapAlertStatusToCardStatus = (
  alertStatus: AlertStatus,
): 'operational' | 'maintenance' | 'offline' => {
  switch (alertStatus) {
    case 'ok':
      return 'operational';
    case 'warning':
      return 'maintenance';
    case 'critical':
      return 'offline';
    default:
      return 'operational';
  }
};

interface MachineListPageProps {
  machines: Machine[];
}

export function MachineListPage({ machines: initialMachines }: MachineListPageProps) {
  const [machines, setMachines] = useState<MachineWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<{ id: string; name: string } | null>(null);
  const router = useInternalRouter();
  const t = useTranslations('machines');
  const tActions = useTranslations('actions');

  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery((id: string) =>
    deleteMachine(id),
  );

  // Fetch latest reports for all machines to calculate alert status
  useEffect(() => {
    const fetchMachinesWithStatus = async () => {
      if (initialMachines.length === 0) {
        setMachines([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const machinesWithStatus = await Promise.all(
        initialMachines.map(async (machine) => {
          try {
            const reportResponse = await getLatestReport(machine.id);
            const latestReport = reportResponse.data || null;
            const alertStatus = calculateStatusFromLatestReport(latestReport);

            return {
              ...machine,
              latestReport,
              alertStatus,
            };
          } catch (error) {
            console.error(`Failed to fetch report for machine ${machine.id}:`, error);
            return {
              ...machine,
              latestReport: null,
              alertStatus: 'unknown' as AlertStatus,
            };
          }
        }),
      );

      setMachines(machinesWithStatus);
      setIsLoading(false);
    };

    fetchMachinesWithStatus();
  }, [initialMachines]);

  const handleSuccess = () => {
    router.refresh();
  };

  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (machine: { id: string; name: string }) => {
    setMachineToDelete(machine);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!machineToDelete) return;

    const response = await executeDelete(machineToDelete.id);

    if (!response.errors) {
      setMachines((prevMachines) =>
        prevMachines.filter((machine) => machine.id !== machineToDelete.id),
      );
      toast.success(t('deletedSuccessfully'));
    } else {
      toast.error(response.errors.join(', '));
    }

    setIsDeleteDialogOpen(false);
    setMachineToDelete(null);
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h2">{t('pageTitle')}</Typography>
            <Typography variant="muted">{t('pageDescription')}</Typography>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newButton')}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <MachineCardSkeleton key={i} />
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-12">
            <Typography variant="muted">{t('emptyState')}</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => {
              // Use calculated alert status from latest report
              const alertStatus = machine.alertStatus || 'unknown';
              const cardStatus = mapAlertStatusToCardStatus(alertStatus);

              return (
                <MachineCard
                  key={machine.id}
                  id={machine.id}
                  name={machine.name}
                  blueprintName={machine.blueprint?.name || t('noBlueprint')}
                  imageUrl={machine.imageUrl}
                  location={machine.location}
                  lastInspection={machine.lastInspection}
                  status={cardStatus}
                  onEdit={() => handleEdit(machine)}
                  onDelete={() => handleDeleteClick({ id: machine.id, name: machine.name })}
                />
              );
            })}
          </div>
        )}
      </div>

      <MachineCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {selectedMachine && (
        <MachineEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMachine(null);
          }}
          onSuccess={handleSuccess}
          machine={selectedMachine}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription', { name: machineToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{tActions('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? tActions('deleting') : t('confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
