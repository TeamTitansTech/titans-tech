import ResetPasswordForm from './ResetPasswordForm';

interface AdminResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default async function AdminResetPasswordPage({ params }: AdminResetPasswordPageProps) {
  const { token } = await params;
  return <ResetPasswordForm token={token} />;
}
