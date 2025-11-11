'use client';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { loginSysAdmin, loginCompanyUser } from '@/data/services/auth.api';
import { setCookie } from '@/lib/cookies';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useRouter } from '@/i18n/routing';

type LoginFormProps = {
  brandTitle: string;
  brandSubtitle: string;
  brandIcon?: LucideIcon;
  loginType: 'admin' | 'client';
  companyId?: string;
};

export function LoginForm({
  brandTitle,
  brandSubtitle,
  brandIcon: BrandIcon,
  loginType,
  companyId,
}: LoginFormProps) {
  const t = useTranslations('login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setSysAdminUser } = useSysAdmin();
  const { setCompanyUser } = useCompanyUser();

  const {
    execute: executeAdmin,
    isLoading: isLoadingAdmin,
    result: resultAdmin,
  } = useLazyQuery(loginSysAdmin);
  const {
    execute: executeClient,
    isLoading: isLoadingClient,
    result: resultClient,
  } = useLazyQuery(loginCompanyUser);

  const isLoading = loginType === 'admin' ? isLoadingAdmin : isLoadingClient;
  const result = loginType === 'admin' ? resultAdmin : resultClient;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loginType === 'admin') {
      const response = await executeAdmin({ email, password });
      if (response?.data?.accessToken) {
        await setCookie('auth_token', response.data.accessToken);
        setSysAdminUser(response.data.user);
        router.replace('/admin/dashboard');
      }
    } else if (loginType === 'client' && companyId) {
      const response = await executeClient({ email, password, companyId });
      if (response?.data?.accessToken) {
        await setCookie('auth_token', response.data.accessToken);
        setCompanyUser(response.data.user);
        window.location.href = '/home';
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="mb-8 p-6 bg-white/10 rounded-full backdrop-blur-sm">
            {BrandIcon && <BrandIcon className="w-16 h-16" strokeWidth={1.5} />}
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">{brandTitle}</h1>
          <p className="text-xl text-blue-100 text-center max-w-md">{brandSubtitle}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex mb-4 p-4 bg-primary/10 rounded-full">
              {BrandIcon && <BrandIcon className="w-12 h-12 text-primary" strokeWidth={1.5} />}
            </div>
            <h2 className="text-2xl font-bold text-foreground">{brandTitle}</h2>
            <p className="text-muted-foreground mt-2">{brandSubtitle}</p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">{t('title')}</h2>
            <p className="mt-2 text-muted-foreground">
              {loginType === 'admin' ? t('description') : t('clientDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('form.email.label')}</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('form.email.placeholder')}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('form.password.label')}</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  {t('form.forgotPassword')}
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('form.password.placeholder')}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {result?.errors && result.errors.length > 0 && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                <ul className="text-sm text-destructive space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white h-12 text-base"
            >
              {isLoading ? t('form.submitting') : t('form.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
