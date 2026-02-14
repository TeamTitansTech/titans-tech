'use client';

import { resetPassword } from '@/data/services/password-reset.api';
import PasswordForm from '@/components/auth/PasswordForm';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const handleSubmit = async (password: string, confirmPassword: string) => {
    const response = await resetPassword({ token, password, confirmPassword });

    if (response?.data) {
      window.location.href = '/admin/login?passwordReset=true';
    } else if (response?.errors) {
      throw new Error(response.errors.join(', '));
    }
  };

  return <PasswordForm onSubmit={handleSubmit} translationNamespace="setPassword" />;
}
