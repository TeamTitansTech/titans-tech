'use client';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/dashboard');
  };

  return (
    <LoginForm
      brandTitle="Admin Portal"
      brandSubtitle="Manage blueprints and industrial systems"
      brandIcon={Shield}
      loginType="admin"
      onSuccess={handleSuccess}
    />
  );
}
