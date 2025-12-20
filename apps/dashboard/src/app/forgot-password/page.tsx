'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPassword } from '@/data/services/password-reset.api';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await forgotPassword({ email });
    setIsLoading(false);
    setSubmitted(true);
  };

  const handleBackToLogin = () => {
    // Detect if we're on a subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Check if it's a subdomain (e.g., "mycompany.localhost")
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      const subdomain = parts[0];
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${protocol}//${subdomain}.localhost${port}/`;
    } else {
      window.location.href = '/admin/login';
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">{t('success.title')}</h1>
          <p className="text-muted-foreground">{t('success.message')}</p>
          <Button onClick={handleBackToLogin} className="w-full">
            {t('success.backToLogin')}
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
            <Label htmlFor="email">{t('form.email.label')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('form.email.placeholder')}
              required
              disabled={isLoading}
            />
          </div>

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

          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-primary hover:underline"
            >
              {t('backToLogin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
