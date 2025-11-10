'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import {
  addUserToBranch,
  removeUserFromBranch,
  setCompanyAdmin,
  setCompanyManager,
} from '@/data/services/company-branches.api';
import { getAllUsers } from '@/data/services/users.api';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useState, useEffect } from 'react';
import { Company } from '@/data/services/companies.api';
import { CompanyBranch } from '@/data/services/company-branches.api';
import { UserResponseDto } from '@titans-tech/shared';
import UserPermissionsManager from './UserPermissionsManager';

interface Props {
  selectedCompany: Company | null;
  selectedBranch: CompanyBranch | null;
  onClose: () => void;
}

export default function BranchUsersManager({ selectedCompany, selectedBranch, onClose }: Props) {
  const { sysAdminUser } = useSysAdmin();
  const [branchUsers, setBranchUsers] = useState<UserResponseDto[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserResponseDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissionsUser, setPermissionsUser] = useState<UserResponseDto | null>(null);

  const { execute: executeGetUsers, isLoading: isLoadingUsers } = useLazyQuery(getAllUsers);
  const { execute: executeAddUser, isLoading: isAddingUser } = useLazyQuery(addUserToBranch);
  const { execute: executeRemoveUser, isLoading: isRemovingUser } =
    useLazyQuery(removeUserFromBranch);
  const { execute: executeSetCompanyAdmin, isLoading: isSettingAdmin } =
    useLazyQuery(setCompanyAdmin);
  const { execute: executeSetCompanyManager, isLoading: isSettingManager } =
    useLazyQuery(setCompanyManager);

  const loadUsers = async () => {
    if (!selectedCompany || !selectedBranch) return;

    const response = await executeGetUsers({ companyId: selectedCompany.id });
    if (response?.data) {
      // Filter users who are in this branch
      const usersInBranch = response.data.filter((user) =>
        user.branches.some((ub) => ub.branch.id === selectedBranch.id),
      );
      setBranchUsers(usersInBranch);

      // Filter users who are NOT in this branch
      const usersNotInBranch = response.data.filter(
        (user) => !user.branches.some((ub) => ub.branch.id === selectedBranch.id),
      );
      setAvailableUsers(usersNotInBranch);
    }
  };

  useEffect(() => {
    if (sysAdminUser && selectedCompany && selectedBranch) {
      void loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sysAdminUser, selectedCompany, selectedBranch]);

  const handleAddUser = async () => {
    if (!selectedBranch || !selectedUserId) return;

    const response = await executeAddUser({
      branchId: selectedBranch.id,
      userId: selectedUserId,
    });

    if (response?.data) {
      await loadUsers();
      setSelectedUserId('');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedBranch) return;
    if (!confirm('Are you sure you want to remove this user from the branch?')) {
      return;
    }

    const response = await executeRemoveUser({
      branchId: selectedBranch.id,
      userId,
    });

    if (response?.data) {
      await loadUsers();
    }
  };

  const handleToggleCompanyAdmin = async (user: UserResponseDto) => {
    if (!selectedBranch) return;
    const newStatus = !user.isCompanyAdmin;
    const message = newStatus
      ? `Are you sure you want to make ${user.name || user.email} a Company Admin?`
      : `Are you sure you want to remove Company Admin status from ${user.name || user.email}?`;

    if (!confirm(message)) return;

    const response = await executeSetCompanyAdmin({
      branchId: selectedBranch.id,
      userId: user.id,
      isCompanyAdmin: newStatus,
    });

    if (response?.data) {
      await loadUsers();
    }
  };

  const handleToggleCompanyManager = async (user: UserResponseDto) => {
    if (!selectedBranch) return;
    const newStatus = !user.isCompanyManager;
    const message = newStatus
      ? `Are you sure you want to make ${user.name || user.email} a Company Manager?`
      : `Are you sure you want to remove Company Manager status from ${user.name || user.email}?`;

    if (!confirm(message)) return;

    const response = await executeSetCompanyManager({
      branchId: selectedBranch.id,
      userId: user.id,
      isCompanyManager: newStatus,
    });

    if (response?.data) {
      await loadUsers();
    }
  };

  if (!sysAdminUser || !selectedCompany || !selectedBranch) {
    return null;
  }

  const isLoading = isAddingUser || isRemovingUser || isSettingAdmin || isSettingManager;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black ">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg  p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Manage Users - {selectedBranch.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-lg font-medium">Add User to Branch</h3>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isLoading || availableUsers.length === 0}
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm "
            >
              <option value="">
                {availableUsers.length === 0 ? 'No available users' : 'Select a user...'}
              </option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email} ({user.email})
                  {user.isCompanyAdmin && ' - Company Admin'}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddUser}
              disabled={isLoading || !selectedUserId}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed "
            >
              {isAddingUser ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-medium">Users in this Branch ({branchUsers.length})</h3>
          <div className="rounded border border-gray-300">
            {isLoadingUsers ? (
              <div className="p-4 text-center text-gray-500">Loading users...</div>
            ) : branchUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No users assigned to this branch</div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-gray-300 ">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {user.isCompanyAdmin && (
                            <span className="inline-flex rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                              Company Admin
                            </span>
                          )}
                          {user.isCompanyManager && (
                            <span className="inline-flex rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
                              Company Manager
                            </span>
                          )}
                          {!user.isCompanyAdmin && !user.isCompanyManager && (
                            <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                              User
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setPermissionsUser(user)}
                            disabled={isLoading}
                            className="text-xs text-blue-600 hover:underline disabled:text-gray-400"
                          >
                            Permissions
                          </button>
                          <button
                            onClick={() => handleToggleCompanyManager(user)}
                            disabled={isLoading}
                            className="text-xs text-indigo-600 hover:underline disabled:text-gray-400"
                          >
                            {user.isCompanyManager ? 'Remove Manager' : 'Make Manager'}
                          </button>
                          <button
                            onClick={() => handleToggleCompanyAdmin(user)}
                            disabled={isLoading}
                            className="text-xs text-purple-600 hover:underline disabled:text-gray-400"
                          >
                            {user.isCompanyAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={isLoading}
                            className="text-xs text-red-600 hover:underline disabled:text-gray-400"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700  disabled:cursor-not-allowed "
          >
            Close
          </button>
        </div>
      </div>

      {permissionsUser && (
        <UserPermissionsManager
          user={permissionsUser}
          branchId={selectedBranch.id}
          onClose={() => setPermissionsUser(null)}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
}
