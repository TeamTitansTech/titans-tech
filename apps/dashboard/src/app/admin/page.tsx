'use client';
import { SysAdminProvider } from '@/contexts/SysAdminContext';
import LoginForm from './components/LoginForm';
import UpdatePassword from './components/UpdatePassword';
import CompaniesManager from './components/CompaniesManager';
import CompanyBranchesManager from './components/CompanyBranchesManager';
import { useState } from 'react';
import { Company } from '@/data/services/companies.api';

export default function AdminPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <SysAdminProvider>
      <div className="flex flex-col gap-8">
        <LoginForm />
        <UpdatePassword />
        <CompaniesManager onSelectCompany={setSelectedCompany} />
        {selectedCompany && (
          <div>
            <button
              onClick={() => setSelectedCompany(null)}
              className="mb-4 text-sm text-blue-600 hover:underline"
            >
              ← Back to Companies
            </button>
            <CompanyBranchesManager selectedCompany={selectedCompany} />
          </div>
        )}
      </div>
    </SysAdminProvider>
  );
}
