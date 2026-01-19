'use client';

import { setPassword } from '@/data/services/password-reset.api';
import PasswordForm from '@/components/auth/PasswordForm';

interface SetPasswordFormProps {
  token: string;
}

export default function SetPasswordForm({ token }: SetPasswordFormProps) {
  const handleSubmit = async (password: string, confirmPassword: string) => {
    const response = await setPassword({ token, password, confirmPassword });

    if (response?.data) {
      window.location.href = '/admin/login?activated=true';
    } else if (response?.errors) {
      throw new Error(response.errors.join(', '));
    }
  };

  return <PasswordForm onSubmit={handleSubmit} translationNamespace="setPassword" />;
}
