import { validateToken } from '@/data/services/password-reset.api';
import SetPasswordForm from './SetPasswordForm';
import { getTranslations } from 'next-intl/server';

interface SubdomainSetPasswordPageProps {
  params: Promise<{ subdomain: string; token: string }>;
}

export default async function SubdomainSetPasswordPage({ params }: SubdomainSetPasswordPageProps) {
  const { subdomain, token } = await params;
  const t = await getTranslations('setPassword');

  const validationResult = await validateToken(token);

  if (!validationResult?.data?.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">{t('invalidLink.title')}</h1>
          <p className="text-muted-foreground">{t('invalidLink.message')}</p>
        </div>
      </div>
    );
  }

  return <SetPasswordForm token={token} subdomain={subdomain} />;
}
