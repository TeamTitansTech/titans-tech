'use client';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/home');
  };

  return (
    <LoginForm
      brandTitle="InspectPro"
      brandSubtitle="Industrial Management & Inspection Platform"
      brandIcon={Wrench}
      loginType="client"
      onSuccess={handleSuccess}
    />
  );
}
