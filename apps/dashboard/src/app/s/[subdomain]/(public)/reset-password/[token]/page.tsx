import ResetPasswordForm from './ResetPasswordForm';

interface SubdomainResetPasswordPageProps {
  params: Promise<{ subdomain: string; token: string }>;
}

export default async function SubdomainResetPasswordPage({
  params,
}: SubdomainResetPasswordPageProps) {
  const { subdomain, token } = await params;
  return <ResetPasswordForm token={token} subdomain={subdomain} />;
}
