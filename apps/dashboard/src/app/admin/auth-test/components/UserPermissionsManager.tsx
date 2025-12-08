'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { setUserPermissions } from '@/data/services/company-branches.api';
import { useState } from 'react';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';
import {
  type Permissions,
  type BranchPermissionType,
  PERMISSION_GROUPS,
  PermissionCategory,
  EMPTY_PERMISSIONS,
} from '@titans-tech/shared/types/permissions';

interface Props {
  user: UserResponseDto;
  branchId: string;
  onClose: () => void;
  onUpdate: () => void;
}

// Map category enum to display labels
const categoryLabels: Record<PermissionCategory, string> = {
  [PermissionCategory.USER_MANAGEMENT]: 'User Management',
  [PermissionCategory.BRANCH_MANAGEMENT]: 'Branch Management',
  [PermissionCategory.MACHINE_MANAGEMENT]: 'Machines',
  [PermissionCategory.SERVICE_MANAGEMENT]: 'Services',
  [PermissionCategory.PRODUCTION_LINE_MANAGEMENT]: 'Production Lines',
};

// Map permission keys to display labels
const permissionLabels: Record<BranchPermissionType, string> = {
  readUsers: 'Read Users',
  createUsers: 'Create Users',
  updateUsers: 'Update Users',
  deleteUsers: 'Delete Users',
  manageUserPermissions: 'Manage User Permissions',
  assignUsersToBranches: 'Assign Users to Branches',
  readBranches: 'Read Branches',
  updateBranches: 'Update Branches',
  readMachines: 'Read Machines',
  createMachines: 'Create Machines',
  updateMachines: 'Update Machines',
  deleteMachines: 'Delete Machines',
  readServices: 'Read Services',
  createServices: 'Create Services',
  updateServices: 'Update Services',
  deleteServices: 'Delete Services',
  readProductionLines: 'Read Production Lines',
  createProductionLines: 'Create Production Lines',
  updateProductionLines: 'Update Production Lines',
  deleteProductionLines: 'Delete Production Lines',
};

export default function UserPermissionsManager({ user, branchId, onClose, onUpdate }: Props) {
  const tActions = useTranslations('actions');
  const branchPermissions = user.branches.find((ub) => ub.branch.id === branchId);
  const [permissions, setPermissions] = useState<Permissions>(() => {
    if (branchPermissions) {
      return {
        readUsers: branchPermissions.readUsers,
        createUsers: branchPermissions.createUsers,
        updateUsers: branchPermissions.updateUsers,
        deleteUsers: branchPermissions.deleteUsers,
        manageUserPermissions: branchPermissions.manageUserPermissions,
        assignUsersToBranches: branchPermissions.assignUsersToBranches,
        readBranches: branchPermissions.readBranches,
        updateBranches: branchPermissions.updateBranches,
        readMachines: branchPermissions.readMachines,
        createMachines: branchPermissions.createMachines,
        updateMachines: branchPermissions.updateMachines,
        deleteMachines: branchPermissions.deleteMachines,
        readServices: branchPermissions.readServices,
        createServices: branchPermissions.createServices,
        updateServices: branchPermissions.updateServices,
        deleteServices: branchPermissions.deleteServices,
        readProductionLines: branchPermissions.readProductionLines,
        createProductionLines: branchPermissions.createProductionLines,
        updateProductionLines: branchPermissions.updateProductionLines,
        deleteProductionLines: branchPermissions.deleteProductionLines,
      };
    }
    return { ...EMPTY_PERMISSIONS };
  });
  const { execute: executeSetPermissions, isLoading } = useLazyQuery(setUserPermissions);

  const handleTogglePermission = (key: keyof Permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    const response = await executeSetPermissions({
      branchId,
      userId: user.id,
      permissions: { ...permissions },
    });

    if (response?.data) {
      onUpdate();
      onClose();
    }
  };

  const handleSelectAll = (groupKeys: string[]) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      groupKeys.forEach((key) => {
        updated[key as keyof Permissions] = true;
      });
      return updated;
    });
  };

  const handleDeselectAll = (groupKeys: string[]) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      groupKeys.forEach((key) => {
        updated[key as keyof Permissions] = false;
      });
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Typography variant="h2" className="text-xl font-semibold">
              Manage Permissions
            </Typography>
            <Typography variant="small" className="text-gray-600">
              {user.name || user.email} -{' '}
              {user.branches.find((ub) => ub.branch.id === branchId)?.branch.name}
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.category} className="rounded border border-gray-300 p-4">
              <div className="mb-3 flex items-center justify-between">
                <Typography variant="h3" className="font-medium text-gray-900">
                  {categoryLabels[group.category]}
                </Typography>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectAll(group.permissions)}
                    className="text-xs text-blue-600 hover:underline"
                    disabled={isLoading}
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => handleDeselectAll(group.permissions)}
                    className="text-xs text-gray-600 hover:underline"
                    disabled={isLoading}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {group.permissions.map((permissionKey) => (
                  <label
                    key={permissionKey}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permissions[permissionKey] || false}
                      onChange={() => handleTogglePermission(permissionKey)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{permissionLabels[permissionKey]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tActions('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? tActions('saving') : tActions('savePermissions')}
          </button>
        </div>
      </div>
    </div>
  );
}
