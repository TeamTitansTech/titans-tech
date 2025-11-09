'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/data/services/users.api';
import { getAllBranches, CompanyBranch } from '@/data/services/company-branches.api';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { FormEvent, useState, useEffect } from 'react';
import { Company } from '@/data/services/companies.api';
import { UserResponseDto } from '@titans-tech/shared';

interface Props {
  selectedCompany: Company | null;
}

export default function UsersManager({ selectedCompany }: Props) {
  const { sysAdminUser } = useSysAdmin();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);

  const { execute: executeGetAll, isLoading: isLoadingList } = useLazyQuery(getAllUsers);
  const { execute: executeGetBranches, isLoading: isLoadingBranches } =
    useLazyQuery(getAllBranches);
  const { execute: executeCreate, isLoading: isCreating } = useLazyQuery(createUser);
  const { execute: executeUpdate, isLoading: isUpdating } = useLazyQuery(updateUser);
  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery(deleteUser);

  const loadUsers = async () => {
    if (!selectedCompany) return;
    const response = await executeGetAll({ companyId: selectedCompany.id });
    if (response?.data) {
      setUsers(response.data);
    }
  };

  const loadBranches = async () => {
    if (!selectedCompany) return;
    const response = await executeGetBranches({ companyId: selectedCompany.id });
    if (response?.data) {
      setBranches(response.data);
    }
  };

  useEffect(() => {
    if (sysAdminUser && selectedCompany) {
      void loadUsers();
      void loadBranches();
    } else {
      setUsers([]);
      setBranches([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sysAdminUser, selectedCompany]);

  const handleCreateClick = () => {
    setIsCreatingMode(true);
    setShowForm(true);
    setEditingUser(null);
    setName('');
    setEmail('');
    setSelectedBranchId('');
    setIsCompanyAdmin(false);
  };

  const handleEditClick = (user: UserResponseDto) => {
    setIsCreatingMode(false);
    setShowForm(true);
    setEditingUser(user);
    setName(user.name || '');
    setEmail(user.email);
    setSelectedBranchId('');
    setIsCompanyAdmin(user.isCompanyAdmin);
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsCreatingMode(false);
    setEditingUser(null);
    setName('');
    setEmail('');
    setSelectedBranchId('');
    setIsCompanyAdmin(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;

    if (isCreatingMode) {
      if (!selectedBranchId) {
        alert('Please select a branch');
        return;
      }

      const response = await executeCreate({
        branchId: selectedBranchId,
        data: {
          name,
          email,
          isCompanyAdmin,
          isCompanyManager: false,
        },
      });

      if (response?.data) {
        await loadUsers();
        handleCancel();
      }
    } else if (editingUser) {
      const response = await executeUpdate({
        companyId: selectedCompany.id,
        userId: editingUser.id,
        data: {
          name,
          email,
        },
      });

      if (response?.data) {
        await loadUsers();
        handleCancel();
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (!selectedCompany) return;
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const response = await executeDelete({
      companyId: selectedCompany.id,
      userId,
    });
    if (response !== null) {
      await loadUsers();
      if (editingUser?.id === userId) {
        handleCancel();
      }
    }
  };

  if (!sysAdminUser || !selectedCompany) {
    return (
      <div className="mx-auto max-w-4xl p-5">
        <p className="text-center text-gray-500">Please select a company to manage its users</p>
      </div>
    );
  }

  const isFormLoading = isCreating || isUpdating;

  return (
    <div className="mx-auto max-w-6xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Users for {selectedCompany.name}</h2>
        {!showForm && (
          <button
            onClick={handleCreateClick}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + New User
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded border border-gray-300 p-4">
          <h3 className="mb-4 text-lg font-semibold">
            {isCreatingMode ? 'Create New User' : 'Edit User'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isCreatingMode && (
              <div className="flex flex-col gap-1">
                <label htmlFor="branch" className="font-medium">
                  Branch *
                </label>
                <select
                  id="branch"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  required
                  disabled={isFormLoading || isLoadingBranches}
                  className="rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                      {branch.isMainBranch && ' (Main)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-medium">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-medium">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>

            {isCreatingMode && (
              <div className="flex items-center gap-2">
                <input
                  id="isCompanyAdmin"
                  type="checkbox"
                  checked={isCompanyAdmin}
                  onChange={(e) => setIsCompanyAdmin(e.target.checked)}
                  disabled={isFormLoading}
                  className="h-4 w-4"
                />
                <label htmlFor="isCompanyAdmin" className="font-medium">
                  Company Admin
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isFormLoading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isFormLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-gray-300">
        {isLoadingList ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found. Create one to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Branches</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.isCompanyAdmin ? (
                      <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded px-2 py-1 text-xs font-medium text-gray-700">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.branches.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.branches.map((ub) => (
                          <span
                            key={ub.branchId}
                            className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                          >
                            {ub.branch.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No branches</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.isUsingDefaultPassword ? (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                        Default Password
                      </span>
                    ) : (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-sm text-blue-600 hover:underline"
                        disabled={isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-sm text-red-600 hover:underline"
                        disabled={isDeleting}
                      >
                        Delete
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
  );
}
