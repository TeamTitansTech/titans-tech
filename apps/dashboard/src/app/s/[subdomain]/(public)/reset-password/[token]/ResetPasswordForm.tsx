'use client';

import { resetPassword } from '@/data/services/password-reset.api';
import PasswordForm from '@/components/auth/PasswordForm';

interface ResetPasswordFormProps {
  token: string;
  subdomain: string;
}

export default function ResetPasswordForm({ token, subdomain }: ResetPasswordFormProps) {
  const handleSubmit = async (password: string, confirmPassword: string) => {
    const response = await resetPassword({ token, password, confirmPassword });

    if (response?.data) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseDomain = hostname.includes('.') ? hostname.split('.').slice(1).join('.') : hostname;

      window.location.href = `${protocol}//${subdomain}.${baseDomain}${port}/?passwordReset=true`;
    } else if (response?.errors) {
      throw new Error(response.errors.join(', '));
    }
  };

  return <PasswordForm onSubmit={handleSubmit} translationNamespace="setPassword" />;
}
