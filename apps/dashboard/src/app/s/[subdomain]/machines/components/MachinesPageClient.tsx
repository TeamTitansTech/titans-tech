'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { MachineCard } from './MachineCard';
import { MachineCreationModal } from './MachineCreationModal';
import { MachineEditModal } from './MachineEditModal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { NoPermission } from '@/components/no-permission/NoPermission';
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
import { useBranch } from '@/contexts/BranchContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { getMachinesByBranch, deleteMachine } from '@/data/services/machines.api';
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

interface Machine {
  id: string;
  name: string;
  blueprintId: string;
  branchId: string;
  fields: { fieldSlug: string; value: string | number }[];
  blueprint?: {
    name: string;
  };
  branch?: {
    id: string;
    name: string;
    companyId: string;
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

export function MachinesPageClient() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<{ id: string; name: string } | null>(null);
  const t = useTranslations('machines');
  const { selectedBranchId, setSelectedBranchId, selectedBranchName } = useBranch();
  const { companyUser } = useCompanyUser();
  const searchParams = useSearchParams();
  const branchIdFromUrl = searchParams.get('branchId');

  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery((id: string) =>
    deleteMachine(id),
  );

  // Check if user has permission to create machines in the selected branch
  const canCreateMachines = () => {
    if (!companyUser || !selectedBranchId) return false;

    // Company admin and manager can create machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === selectedBranchId);
    return userBranch?.createMachines || false;
  };

  // Check if user has permission to update machines in the selected branch
  const canUpdateMachines = () => {
    if (!companyUser || !selectedBranchId) return false;

    // Company admin and manager can update machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === selectedBranchId);
    return userBranch?.updateMachines || false;
  };

  // Check if user has permission to delete machines in the selected branch
  const canDeleteMachines = () => {
    if (!companyUser || !selectedBranchId) return false;

    // Company admin and manager can delete machines
    if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) return true;

    // Check branch-specific permission
    const userBranch = companyUser.branches.find((ub) => ub.branchId === selectedBranchId);
    return userBranch?.deleteMachines || false;
  };

  // Set branch ID from URL if available
  useEffect(() => {
    if (branchIdFromUrl && branchIdFromUrl !== selectedBranchId) {
      setSelectedBranchId(branchIdFromUrl);
    }
  }, [branchIdFromUrl, selectedBranchId, setSelectedBranchId]);

  // Fetch machines when selected branch changes
  useEffect(() => {
    const fetchMachines = async () => {
      if (!selectedBranchId) {
        setMachines([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setErrorStatus(null);
      const response = await getMachinesByBranch(selectedBranchId);

      if (response.errors) {
        setError(response.errors.join(', '));
        setErrorStatus(response.status);
        setMachines([]);
      } else {
        setMachines(response.data || []);
      }
      setIsLoading(false);
    };

    fetchMachines();
  }, [selectedBranchId]);

  const handleSuccess = () => {
    // Refresh machines list
    if (selectedBranchId) {
      getMachinesByBranch(selectedBranchId).then((response) => {
        if (response.data) {
          setMachines(response.data);
        }
      });
    }
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
            <Typography variant="muted">
              {selectedBranchName
                ? `${selectedBranchName} - ${t('pageDescription')}`
                : t('pageDescription')}
            </Typography>
          </div>
          {canCreateMachines() && (
            <Button onClick={() => setIsModalOpen(true)} disabled={!selectedBranchId}>
              <Plus className="w-4 h-4 mr-2" />
              {t('newButton')}
            </Button>
          )}
        </div>

        {!selectedBranchId ? (
          <div className="text-center py-12">
            <Typography variant="muted">Please select a branch to view machines</Typography>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Typography variant="muted">Loading machines...</Typography>
          </div>
        ) : error ? (
          errorStatus === 403 ? (
            <NoPermission />
          ) : (
            <div className="text-center py-12">
              <p className="text-destructive">
                {t('errorLoading')}: {error}
              </p>
            </div>
          )
        ) : machines.length === 0 ? (
          <div className="text-center py-12">
            <Typography variant="muted">{t('emptyState')}</Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                id={machine.id}
                name={machine.name}
                blueprintName={machine.blueprint?.name || t('noBlueprint')}
                location={machine.location}
                lastInspection={machine.lastInspection}
                status={machine.status}
                onEdit={canUpdateMachines() ? () => handleEdit(machine) : undefined}
                onDelete={
                  canDeleteMachines()
                    ? () => handleDeleteClick({ id: machine.id, name: machine.name })
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      <MachineCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('deleting') : t('confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
