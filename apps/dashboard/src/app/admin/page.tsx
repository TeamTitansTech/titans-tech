'use client';
import { SysAdminProvider } from '@/contexts/SysAdminContext';
import LoginForm from './components/LoginForm';
import UpdatePassword from './components/UpdatePassword';

export default function AdminPage() {
  return (
    <SysAdminProvider>
      <div className="flex flex-col gap-8">
        <LoginForm />
        <UpdatePassword />
      </div>
    </SysAdminProvider>
  );
}
