'use client';
import { SysAdminProvider } from '@/contexts/SysAdminContext';
import LoginForm from './components/LoginForm';
import UpdatePassword from './components/UpdatePassword';
import CompaniesManager from './components/CompaniesManager';

export default function AdminPage() {
  return (
    <SysAdminProvider>
      <div className="flex flex-col gap-8">
        <LoginForm />
        <UpdatePassword />
        <CompaniesManager />
      </div>
    </SysAdminProvider>
  );
}
