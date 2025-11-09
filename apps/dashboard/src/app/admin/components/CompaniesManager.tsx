'use client';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  Company,
} from '@/data/services/companies.api';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { FormEvent, useState, useEffect } from 'react';

interface Props {
  onSelectCompany?: (company: Company | null) => void;
}

export default function CompaniesManager({ onSelectCompany }: Props) {
  const { sysAdminUser } = useSysAdmin();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [brandColor, setBrandColor] = useState('');

  const { execute: executeGetAll, isLoading: isLoadingList } = useLazyQuery(getAllCompanies);
  const { execute: executeCreate, isLoading: isCreating } = useLazyQuery(createCompany);
  const { execute: executeUpdate, isLoading: isUpdating } = useLazyQuery(updateCompany);
  const { execute: executeDelete, isLoading: isDeleting } = useLazyQuery(deleteCompany);

  const loadCompanies = async () => {
    const response = await executeGetAll();
    if (response?.data) {
      setCompanies(response.data);
    }
  };

  useEffect(() => {
    if (sysAdminUser) {
      void loadCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sysAdminUser]);

  const handleCreateClick = () => {
    setIsCreatingMode(true);
    setShowForm(true);
    setEditingCompany(null);
    setName('');
    setSlug('');
    setLogo('');
    setBrandColor('');
  };

  const handleEditClick = (company: Company) => {
    setIsCreatingMode(false);
    setShowForm(true);
    setEditingCompany(company);
    setName(company.name);
    setSlug(company.slug);
    setLogo(company.logo || '');
    setBrandColor(company.brandColor || '');
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsCreatingMode(false);
    setEditingCompany(null);
    setName('');
    setSlug('');
    setLogo('');
    setBrandColor('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isCreatingMode) {
      const response = await executeCreate({
        data: {
          name,
          slug,
          logo: logo || undefined,
          brandColor: brandColor || undefined,
        },
      });

      if (response?.data) {
        await loadCompanies();
        handleCancel();
      }
    } else if (editingCompany) {
      const response = await executeUpdate({
        companyId: editingCompany.id,
        data: {
          name,
          slug,
          logo: logo || undefined,
          brandColor: brandColor || undefined,
        },
      });

      if (response?.data) {
        await loadCompanies();
        handleCancel();
      }
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    const response = await executeDelete({ companyId });
    if (response !== null) {
      await loadCompanies();
      if (editingCompany?.id === companyId) {
        handleCancel();
      }
    }
  };

  if (!sysAdminUser) {
    return null;
  }

  const isFormLoading = isCreating || isUpdating;

  return (
    <div className="mx-auto max-w-4xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Companies Manager</h2>
        {!showForm && (
          <button
            onClick={handleCreateClick}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + New Company
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded border border-gray-300  p-4">
          <h3 className="mb-4 text-lg font-semibold">
            {isCreatingMode ? 'Create New Company' : 'Edit Company'}
          </h3>
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

            <div className="flex flex-col gap-1">
              <label htmlFor="slug" className="font-medium">
                Slug *
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isFormLoading}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="brandColor" className="font-medium">
                Brand Color
              </label>
              <input
                id="brandColor"
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#000000"
                disabled={isFormLoading}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
              />
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
          <div className="p-4 text-center text-gray-500">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No companies found</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-300 ">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Brand Color</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-4 py-3 text-sm">{company.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{company.slug}</td>
                  <td className="px-4 py-3 text-sm">
                    {company.brandColor && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-5 w-5 rounded border border-gray-300"
                          style={{ backgroundColor: company.brandColor }}
                        />
                        <span className="font-mono text-xs">{company.brandColor}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onSelectCompany && (
                      <button
                        onClick={() => onSelectCompany(company)}
                        className="mr-2 text-sm text-purple-600 hover:underline"
                      >
                        Manage Branches
                      </button>
                    )}
                    <button
                      onClick={() => handleEditClick(company)}
                      disabled={isDeleting}
                      className="mr-2 text-sm text-blue-600 hover:underline disabled:text-gray-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
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
    </div>
  );
}
