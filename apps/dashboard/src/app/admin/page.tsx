'use client';
import { LoginForm } from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  return (
    <LoginForm
      brandTitle="Admin Portal"
      brandSubtitle="Manage blueprints and industrial systems"
      loginType="admin"
    />
  );
}
