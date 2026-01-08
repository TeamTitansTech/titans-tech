'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  CompanyBranch,
} from '@/data/services/company-branches.api';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { FormEvent, useState, useEffect } from 'react';
import { Company } from '@/data/services/companies.api';
import BranchUsersManager from './BranchUsersManager';
import { Typography } from '@/components/ui/typography';

interface Props {
  selectedCompany: Company | null;
}

export default function CompanyBranchesManager({ selectedCompany }: Props) {
  const { sysAdminUser } = useSysAdmin();
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [managingUsersBranch, setManagingUsersBranch] = useState<CompanyBranch | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [isMainBranch, setIsMainBranch] = useState(false);

  const { execute: executeGetAll, isLoading: isLoadingList } = useLazyQuery(getAllBranches);
  const { execute: executeCreate, isLoading: isCreating } = useLazyQuery(createBranch);
  const { execute: executeUpdate, isLoading: isUpdating } = useLazyQuery(updateBranch);
  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery(deleteBranch);

  const loadBranches = async () => {
    if (!selectedCompany) return;
    const response = await executeGetAll({ companyId: selectedCompany.id });
    if (response?.data) {
      setBranches(response.data);
    }
  };

  useEffect(() => {
    if (sysAdminUser && selectedCompany) {
      void loadBranches();
    } else {
      setBranches([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sysAdminUser, selectedCompany]);

  const handleCreateClick = () => {
    setIsCreatingMode(true);
    setShowForm(true);
    setEditingBranch(null);
    setName('');
    setIsMainBranch(false);
  };

  const handleEditClick = (branch: CompanyBranch) => {
    setIsCreatingMode(false);
    setShowForm(true);
    setEditingBranch(branch);
    setName(branch.name);
    setIsMainBranch(branch.isMainBranch);
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsCreatingMode(false);
    setEditingBranch(null);
    setName('');
    setIsMainBranch(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;

    if (isCreatingMode) {
      const response = await executeCreate({
        companyId: selectedCompany.id,
        data: { name, isMainBranch },
      });

      if (response?.data) {
        await loadBranches();
        handleCancel();
      }
    } else if (editingBranch) {
      const response = await executeUpdate({
        branchId: editingBranch.id,
        data: { name, isMainBranch },
      });

      if (response?.data) {
        await loadBranches();
        handleCancel();
      }
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!selectedCompany) return;
    if (!confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    const response = await executeDelete({
      branchId,
      companyId: selectedCompany.id,
    });
    if (response !== null) {
      await loadBranches();
      if (editingBranch?.id === branchId) {
        handleCancel();
      }
    }
  };

  if (!sysAdminUser || !selectedCompany) {
    return (
      <div className="mx-auto max-w-4xl p-5">
        <p className="text-center text-gray-500">Please select a company to manage its branches</p>
      </div>
    );
  }

  const isFormLoading = isCreating || isUpdating;

  return (
    <div className="mx-auto max-w-4xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <Typography variant="h2" className="text-2xl font-semibold">
          Branches for {selectedCompany.name}
        </Typography>
        {!showForm && (
          <button
            onClick={handleCreateClick}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + New Branch
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded border border-gray-300  p-4">
          <Typography variant="h3" className="mb-4 text-lg font-semibold">
            {isCreatingMode ? 'Create New Branch' : 'Edit Branch'}
          </Typography>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                disabled={isFormLoading}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isMainBranch"
                type="checkbox"
                checked={isMainBranch}
                onChange={(e) => setIsMainBranch(e.target.checked)}
                disabled={isFormLoading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isMainBranch" className="font-medium">
                Set as Main Branch
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isFormLoading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isFormLoading
                  ? isCreatingMode
                    ? 'Creating...'
                    : 'Updating...'
                  : isCreatingMode
                    ? 'Create'
                    : 'Update'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isFormLoading}
                className="rounded border border-gray-300  px-4 py-2 text-sm font-medium text-gray-700 hover: disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded border border-gray-300 ">
        {isLoadingList ? (
          <div className="p-4 text-center text-gray-500">Loading branches...</div>
        ) : branches.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No branches found</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-300 ">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Main Branch</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Created At</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-4 py-3 text-sm">{branch.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {branch.isMainBranch && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Main
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setManagingUsersBranch(branch)}
                      disabled={isDeleting}
                      className="mr-2 text-sm text-green-600 hover:underline disabled:text-gray-400"
                    >
                      Manage Users
                    </button>
                    <button
                      onClick={() => handleEditClick(branch)}
                      disabled={isDeleting}
                      className="mr-2 text-sm text-blue-600 hover:underline disabled:text-gray-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      disabled={isDeleting}
                      className="text-sm text-red-600 hover:underline disabled:text-gray-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {managingUsersBranch && (
        <BranchUsersManager
          selectedCompany={selectedCompany}
          selectedBranch={managingUsersBranch}
          onClose={() => setManagingUsersBranch(null)}
        />
      )}
    </div>
  );
}
