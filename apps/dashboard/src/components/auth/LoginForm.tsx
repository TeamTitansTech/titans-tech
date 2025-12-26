'use client';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLazyQuery } from '@/hooks/useLazyQuery';
import { loginSysAdmin, loginCompanyUser } from '@/data/services/auth.api';
import { setCookie } from '@/lib/cookies';
import { useSysAdmin } from '@/contexts/SysAdminContext';
import { useCompanyUser } from '@/contexts/CompanyUserContext';

type LoginFormProps = {
  brandTitle: string;
  brandSubtitle: string;
  brandIcon?: LucideIcon;
  brandColor?: string | null;
  brandLogo?: string | null;
  loginType: 'admin' | 'client';
  companyId?: string;
  redirectTo?: string;
};

/**
 * Adjusts the brightness of a hex color
 * @param hex - Hex color string (e.g., "#1e6b3a")
 * @param percent - Percentage to adjust (-100 to 100)
 */
function adjustColorBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(2.55 * percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function LoginForm({
  brandTitle,
  brandSubtitle,
  brandIcon: BrandIcon,
  brandColor,
  brandLogo,
  loginType,
  companyId,
  redirectTo,
}: LoginFormProps) {
  // Default blue color for admin login or companies without brand color
  const defaultColor = '#1e40af';

  // Use brand color or default
  const bgColor = brandColor || defaultColor;
  const bgColorDark = brandColor ? adjustColorBrightness(brandColor, -20) : '#1e3a8a';

  // Always use inline styles to prevent hydration flash
  const bgStyle = {
    background: `linear-gradient(to bottom right, ${bgColor}, ${bgColorDark}, ${bgColor})`,
  };

  const buttonStyle = {
    backgroundColor: bgColor,
  };
  const t = useTranslations('login');
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
        // Use full page navigation to ensure cookie is sent with the request
        window.location.href = '/admin/dashboard';
      }
    } else if (loginType === 'client' && companyId) {
      const response = await executeClient({ email, password, companyId });
      if (response?.data?.accessToken) {
        await setCookie('auth_token', response.data.accessToken);
        setCompanyUser(response.data.user);
        window.location.href = redirectTo || '/home';
      }
    }
  };

  return (
    <div className="flex min-h-screen" data-testid="login-page">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={bgStyle}
        data-testid="brand-panel"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          {brandLogo ? (
            <div className="mb-8 relative w-96 h-96" data-testid="brand-logo-desktop">
              <Image src={brandLogo} alt={brandTitle} fill className="object-contain" />
            </div>
          ) : (
            <>
              <div
                className="mb-8 p-6 bg-white/10 rounded-full backdrop-blur-sm"
                data-testid="brand-icon-desktop"
              >
                {BrandIcon && <BrandIcon className="w-16 h-16" strokeWidth={1.5} />}
              </div>
              <h1 className="text-4xl font-bold mb-4 text-center" data-testid="brand-title-desktop">
                {brandTitle}
              </h1>
              <p
                className="text-xl text-white/80 text-center max-w-md"
                data-testid="brand-subtitle-desktop"
              >
                {brandSubtitle}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-8" data-testid="brand-header-mobile">
            {brandLogo ? (
              <div className="relative w-32 h-32 mx-auto mb-4" data-testid="brand-logo-mobile">
                <Image src={brandLogo} alt={brandTitle} fill className="object-contain" />
              </div>
            ) : (
              <>
                <div
                  className="inline-flex mb-4 p-4 bg-primary/10 rounded-full"
                  data-testid="brand-icon-mobile"
                >
                  {BrandIcon && <BrandIcon className="w-12 h-12 text-primary" strokeWidth={1.5} />}
                </div>
                <h2 className="text-2xl font-bold text-foreground" data-testid="brand-title-mobile">
                  {brandTitle}
                </h2>
                <p className="text-muted-foreground mt-2" data-testid="brand-subtitle-mobile">
                  {brandSubtitle}
                </p>
              </>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground" data-testid="login-title">
              {t('title')}
            </h2>
            <p className="mt-2 text-muted-foreground" data-testid="login-description">
              {loginType === 'admin' ? t('description') : t('clientDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
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
                  data-testid="email-input"
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
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                  data-testid="forgot-password-link"
                >
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
                  data-testid="password-input"
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
              <div
                className="rounded-md border border-destructive bg-destructive/10 p-3"
                data-testid="login-errors"
              >
                <ul className="text-sm text-destructive space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index} data-testid={`login-error-${index}`}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white h-12 text-base hover:opacity-90"
              style={buttonStyle}
              data-testid="submit-button"
            >
              {isLoading ? t('form.submitting') : t('form.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
