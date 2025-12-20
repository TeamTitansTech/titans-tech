'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateToken, setPassword } from '@/data/services/password-reset.api';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations('setPassword'); // Reuse same translations as set-password
  const token = params.token as string;
  const subdomain = searchParams.get('subdomain');

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenMessage, setTokenMessage] = useState<string>('');
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPasswordValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Validate token on mount
    validateToken(token).then((response) => {
      if (response.data?.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setTokenMessage(response.data?.message || 'Invalid token');
      }
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const response = await setPassword({ token, password, confirmPassword });
    setIsLoading(false);

    if (response?.data) {
      // Success - redirect based on subdomain query param
      if (subdomain) {
        // Regular user - redirect to subdomain URL
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';
        window.location.href = `${protocol}//${subdomain}.localhost${port}/home?passwordReset=true`;
      } else {
        // Admin user - redirect to admin login
        window.location.href = '/admin/login?passwordReset=true';
      }
    } else if (response?.errors) {
      setError(response.errors.join(', '));
    }
  };

  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-destructive bg-destructive/10 p-8">
          <h1 className="text-2xl font-bold text-destructive">{t('invalidToken.title')}</h1>
          <p className="text-sm">{tokenMessage}</p>
          <Button
            onClick={() => {
              if (subdomain) {
                const protocol = window.location.protocol;
                const port = window.location.port ? `:${window.location.port}` : '';
                window.location.href = `${protocol}//${subdomain}.localhost${port}/home`;
              } else {
                window.location.href = '/admin/login';
              }
            }}
            className="w-full"
          >
            {t('invalidToken.backToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">{t('form.password.label')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder={t('form.password.placeholder')}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{t('form.password.requirements')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('form.confirmPassword.label')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              placeholder={t('form.confirmPassword.placeholder')}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('form.submitting')}
              </>
            ) : (
              t('form.submit')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
