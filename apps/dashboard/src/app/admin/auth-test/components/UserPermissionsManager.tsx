'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { setUserPermissions } from '@/data/services/company-branches.api';
import { useState } from 'react';
import { UserResponseDto } from '@titans-tech/shared';
import { Typography } from '@/components/ui/typography';

interface Props {
  user: UserResponseDto;
  branchId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface Permissions {
  // User Management
  readUsers: boolean;
  createUsers: boolean;
  updateUsers: boolean;
  deleteUsers: boolean;
  manageUserPermissions: boolean;
  assignUsersToBranches: boolean;
  // Branch Management
  readBranches: boolean;
  updateBranches: boolean;
  // Blueprints
  readBlueprints: boolean;
  createBlueprints: boolean;
  updateBlueprints: boolean;
  deleteBlueprints: boolean;
  // Machines
  readMachines: boolean;
  createMachines: boolean;
  updateMachines: boolean;
  deleteMachines: boolean;
  // Services
  readServices: boolean;
  createServices: boolean;
  updateServices: boolean;
  deleteServices: boolean;
}

const permissionGroups = {
  'User Management': [
    { key: 'readUsers', label: 'Read Users' },
    { key: 'createUsers', label: 'Create Users' },
    { key: 'updateUsers', label: 'Update Users' },
    { key: 'deleteUsers', label: 'Delete Users' },
    { key: 'manageUserPermissions', label: 'Manage User Permissions' },
    { key: 'assignUsersToBranches', label: 'Assign Users to Branches' },
  ],
  'Branch Management': [
    { key: 'readBranches', label: 'Read Branches' },
    { key: 'updateBranches', label: 'Update Branches' },
  ],
  Blueprints: [
    { key: 'readBlueprints', label: 'Read Blueprints' },
    { key: 'createBlueprints', label: 'Create Blueprints' },
    { key: 'updateBlueprints', label: 'Update Blueprints' },
    { key: 'deleteBlueprints', label: 'Delete Blueprints' },
  ],
  Machines: [
    { key: 'readMachines', label: 'Read Machines' },
    { key: 'createMachines', label: 'Create Machines' },
    { key: 'updateMachines', label: 'Update Machines' },
    { key: 'deleteMachines', label: 'Delete Machines' },
  ],
  Services: [
    { key: 'readServices', label: 'Read Services' },
    { key: 'createServices', label: 'Create Services' },
    { key: 'updateServices', label: 'Update Services' },
    { key: 'deleteServices', label: 'Delete Services' },
  ],
};

export default function UserPermissionsManager({ user, branchId, onClose, onUpdate }: Props) {
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
        readBlueprints: branchPermissions.readBlueprints,
        createBlueprints: branchPermissions.createBlueprints,
        updateBlueprints: branchPermissions.updateBlueprints,
        deleteBlueprints: branchPermissions.deleteBlueprints,
        readMachines: branchPermissions.readMachines,
        createMachines: branchPermissions.createMachines,
        updateMachines: branchPermissions.updateMachines,
        deleteMachines: branchPermissions.deleteMachines,
        readServices: branchPermissions.readServices,
        createServices: branchPermissions.createServices,
        updateServices: branchPermissions.updateServices,
        deleteServices: branchPermissions.deleteServices,
      };
    }
    return {} as Permissions;
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
          {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => (
            <div key={groupName} className="rounded border border-gray-300 p-4">
              <div className="mb-3 flex items-center justify-between">
                <Typography variant="h3" className="font-medium text-gray-900">
                  {groupName}
                </Typography>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectAll(groupPermissions.map((p) => p.key))}
                    className="text-xs text-blue-600 hover:underline"
                    disabled={isLoading}
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => handleDeselectAll(groupPermissions.map((p) => p.key))}
                    className="text-xs text-gray-600 hover:underline"
                    disabled={isLoading}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {groupPermissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permissions[permission.key as keyof Permissions] || false}
                      onChange={() => handleTogglePermission(permission.key as keyof Permissions)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{permission.label}</span>
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}
